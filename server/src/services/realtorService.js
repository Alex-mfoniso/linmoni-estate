import ApiError from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { paginationMeta } from "../utils/pagination.js";
import { propertyResponse, bookingResponse, conversationResponse, messageResponse } from "../utils/clientSerializers.js";
import { sanitizeProfile } from "../utils/sanitizeResponse.js";

export function createRealtorService({
  UserModel,
  PropertyModel,
  BookingModel,
  LeadModel,
  ConversationModel,
  MessageModel,
  NotificationModel
}) {
  return {
    // ----------------------------------------------------
    // DASHBOARD
    // ----------------------------------------------------
    async getDashboard(realtorId) {
      const now = new Date();

      const [
        activeListings,
        pendingListings,
        upcomingInspections,
        newLeads,
        recentLeads,
        upcomingInspectionsList,
        recentProperties,
        unreadMessagesCount
      ] = await Promise.all([
        PropertyModel.countDocuments({ realtorId, status: "active" }),
        PropertyModel.countDocuments({ realtorId, status: "pending" }),
        BookingModel.countDocuments({
          realtorId,
          status: { $in: ["pending", "confirmed", "reschedule_requested"] },
          scheduledAt: { $gte: now }
        }),
        LeadModel.countDocuments({ realtorId, status: "new" }),
        // Recent 5 leads
        LeadModel.find({ realtorId })
          .populate("clientId", "fullName avatar email phone")
          .populate("propertyId", "title coverImage price")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        // 3 upcoming bookings
        BookingModel.find({
          realtorId,
          scheduledAt: { $gte: now },
          status: { $in: ["pending", "confirmed", "reschedule_requested"] }
        })
          .populate("userId", "fullName avatar email phone")
          .populate("propertyId", "title coverImage price location")
          .sort({ scheduledAt: 1 })
          .limit(3)
          .lean(),
        // 4 recent properties
        PropertyModel.find({ realtorId })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
        // Unread messages count
        (async () => {
          const conversations = await ConversationModel.find({ realtorId }).select("_id").lean();
          const convIds = conversations.map((c) => c._id);
          return MessageModel.countDocuments({
            conversationId: { $in: convIds },
            senderId: { $ne: realtorId },
            "readBy.userId": { $not: { $eq: realtorId } }
          });
        })()
      ]);

      return {
        summary: {
          activeListings,
          pendingListings,
          upcomingInspections,
          newLeads,
          unreadMessagesCount
        },
        recentLeads: recentLeads.map(lead => ({
          id: String(lead._id),
          client: lead.clientId ? sanitizeProfile(lead.clientId) : null,
          property: lead.propertyId ? propertyResponse(lead.propertyId) : null,
          source: lead.source,
          status: lead.status,
          notes: lead.notes,
          createdAt: lead.createdAt
        })),
        upcomingInspections: upcomingInspectionsList.map(b => ({
          id: String(b._id),
          scheduledAt: b.scheduledAt,
          timezone: b.timezone,
          message: b.message,
          status: b.status,
          client: b.userId ? sanitizeProfile(b.userId) : null,
          property: b.propertyId ? propertyResponse(b.propertyId) : null
        })),
        recentProperties: recentProperties.map(propertyResponse)
      };
    },

    // ----------------------------------------------------
    // PROPERTIES
    // ----------------------------------------------------
    async getProperties(realtorId, { page, limit, status, search }) {
      const filter = { realtorId };

      if (status && status !== "all") {
        filter.status = status;
      } else {
        // Exclude archived by default in generic searches
        filter.status = { $ne: "archived" };
      }

      if (search) {
        filter.$text = { $search: search };
      }

      const [items, totalItems] = await Promise.all([
        PropertyModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        PropertyModel.countDocuments(filter)
      ]);

      return {
        items: items.map(propertyResponse),
        pagination: paginationMeta(page, limit, totalItems)
      };
    },

    async getPropertyDetail(realtorId, propertyId) {
      const property = await PropertyModel.findOne({ _id: propertyId, realtorId }).lean();
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This property is not available or you are not authorized to view it.");
      }

      const [favouritesCount, leadsCount, bookingsCount] = await Promise.all([
        // Favourites (saved) count
        // Note: we fetch if FavouriteModel is registered, otherwise fallback to 0
        mongoose.models.Favourite
          ? mongoose.models.Favourite.countDocuments({ propertyId })
          : Promise.resolve(0),
        LeadModel.countDocuments({ propertyId }),
        BookingModel.countDocuments({ propertyId })
      ]);

      return {
        property: propertyResponse(property),
        analytics: {
          favouritesCount,
          leadsCount,
          bookingsCount
        }
      };
    },

    async createProperty(realtorId, data) {
      const { title, description, propertyType, listingType, price, address, details, coverImage, images, features, submit } = data;

      // Generate unique slug
      const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const uniqueSuffix = Date.now() + "-" + Math.floor(Math.random() * 1000);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const property = await PropertyModel.create({
        title,
        slug,
        description,
        propertyType,
        listingType,
        price,
        currency: "NGN",
        city: address.city,
        state: address.state,
        country: address.country || "Nigeria",
        location: address.street,
        address: address.street,
        bedrooms: details.bedrooms,
        bathrooms: details.bathrooms,
        toilets: details.bathrooms,
        buildingSize: details.areaSqFt || null,
        amenities: features || [],
        coverImage: coverImage || null,
        images: images || [],
        status: submit ? "pending" : "draft",
        realtorId,
        createdBy: realtorId
      });

      return propertyResponse(property);
    },

    async updateProperty(realtorId, propertyId, data) {
      const property = await PropertyModel.findOne({ _id: propertyId, realtorId });
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This property is not available or you are not authorized.");
      }

      // If active, restrict status modifications
      if (property.status === "active" && data.status && data.status !== "active" && data.status !== "archived") {
        throw new ApiError(400, "INVALID_TRANSITION", "Active properties can only be updated to archived status.");
      }

      const { title, description, propertyType, listingType, price, address, details, coverImage, images, features, status, submit } = data;

      if (title) {
        property.title = title;
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        property.slug = `${baseSlug}-${Date.now()}`;
      }

      if (description) property.description = description;
      if (propertyType) property.propertyType = propertyType;
      if (listingType) property.listingType = listingType;
      if (price != null) property.price = price;

      if (address) {
        if (address.city) property.city = address.city;
        if (address.state) property.state = address.state;
        if (address.country) property.country = address.country;
        if (address.street) {
          property.location = address.street;
          property.address = address.street;
        }
      }

      if (details) {
        if (details.bedrooms != null) property.bedrooms = details.bedrooms;
        if (details.bathrooms != null) {
          property.bathrooms = details.bathrooms;
          property.toilets = details.bathrooms;
        }
        if (details.areaSqFt != null) property.buildingSize = details.areaSqFt;
      }

      if (coverImage !== undefined) property.coverImage = coverImage;
      if (images !== undefined) property.images = images;
      if (features !== undefined) property.amenities = features;

      // Handle submitting drafts or rejected listings
      if (submit) {
        if (property.status !== "draft" && property.status !== "rejected") {
          throw new ApiError(400, "INVALID_STATE", "Only drafts or rejected properties can be submitted for approval.");
        }
        property.status = "pending";
      } else if (status) {
        property.status = status;
      }

      await property.save();
      return propertyResponse(property);
    },

    async archiveProperty(realtorId, propertyId) {
      const property = await PropertyModel.findOne({ _id: propertyId, realtorId });
      if (!property) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This property is not available.");
      }

      property.status = "archived";
      await property.save();
      return propertyResponse(property);
    },

    // ----------------------------------------------------
    // LEADS
    // ----------------------------------------------------
    async getLeads(realtorId, { page, limit, status }) {
      const filter = { realtorId };
      if (status && status !== "all") {
        filter.status = status;
      }

      const [items, totalItems] = await Promise.all([
        LeadModel.find(filter)
          .populate("clientId", "fullName avatar email phone")
          .populate("propertyId", "title coverImage price location")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        LeadModel.countDocuments(filter)
      ]);

      return {
        items: items.map(lead => ({
          id: String(lead._id),
          client: lead.clientId ? sanitizeProfile(lead.clientId) : null,
          property: lead.propertyId ? propertyResponse(lead.propertyId) : null,
          source: lead.source,
          status: lead.status,
          notes: lead.notes,
          lastContactedAt: lead.lastContactedAt,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt
        })),
        pagination: paginationMeta(page, limit, totalItems)
      };
    },

    async getLeadDetail(realtorId, leadId) {
      const lead = await LeadModel.findOne({ _id: leadId, realtorId })
        .populate("clientId", "fullName avatar email phone bio")
        .populate("propertyId", "title coverImage price location status")
        .lean();

      if (!lead) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This lead was not found.");
      }

      return {
        id: String(lead._id),
        client: lead.clientId ? sanitizeProfile(lead.clientId) : null,
        property: lead.propertyId ? propertyResponse(lead.propertyId) : null,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        lastContactedAt: lead.lastContactedAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      };
    },

    async updateLead(realtorId, leadId, { status, notes }) {
      const lead = await LeadModel.findOne({ _id: leadId, realtorId });
      if (!lead) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This lead was not found.");
      }

      if (status) {
        lead.status = status;
        lead.lastContactedAt = new Date();
      }
      if (notes !== undefined) {
        lead.notes = notes;
      }

      await lead.save();
      await lead.populate("clientId", "fullName avatar email phone");
      await lead.populate("propertyId", "title coverImage price location");

      return {
        id: String(lead._id),
        client: lead.clientId ? sanitizeProfile(lead.clientId) : null,
        property: lead.propertyId ? propertyResponse(lead.propertyId) : null,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        lastContactedAt: lead.lastContactedAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      };
    },

    // Helper to trigger automated leads
    async triggerLead({ clientId, realtorId, propertyId, source, status = "new" }) {
      const existing = await LeadModel.findOne({ clientId, propertyId });
      if (existing) {
        // update status to new or touch contacted date
        if (existing.status === "lost") {
          existing.status = "new";
        }
        existing.source = source;
        await existing.save();
        return existing;
      }
      return await LeadModel.create({ clientId, realtorId, propertyId, source, status });
    },

    // ----------------------------------------------------
    // INSPECTION BOOKINGS
    // ----------------------------------------------------
    async getBookings(realtorId, { page, limit, status }) {
      const filter = { realtorId };
      if (status && status !== "all") {
        filter.status = status;
      }

      const [items, totalItems] = await Promise.all([
        BookingModel.find(filter)
          .populate("userId", "fullName avatar email phone")
          .populate("propertyId", "title coverImage price location")
          .sort({ scheduledAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        BookingModel.countDocuments(filter)
      ]);

      return {
        items: items.map(bookingResponse),
        pagination: paginationMeta(page, limit, totalItems)
      };
    },

    async getBookingDetail(realtorId, bookingId) {
      const booking = await BookingModel.findOne({ _id: bookingId, realtorId })
        .populate("userId", "fullName avatar email phone")
        .populate("propertyId", "title coverImage price location")
        .lean();

      if (!booking) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found.");
      }

      return bookingResponse(booking);
    },

    async confirmBooking(realtorId, bookingId) {
      const booking = await BookingModel.findOne({ _id: bookingId, realtorId });
      if (!booking) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found.");
      }

      if (booking.status !== "pending" && booking.status !== "reschedule_requested") {
        throw new ApiError(400, "INVALID_STATE", "Only pending or rescheduled bookings can be confirmed.");
      }

      booking.status = "confirmed";
      booking.confirmedAt = new Date();
      await booking.save();

      // Notify Client
      await NotificationModel.create({
        userId: booking.userId,
        type: "booking_updated",
        title: "Inspection Confirmed",
        message: `Your inspection for the listing has been confirmed for ${booking.scheduledAt.toDateString()}.`,
        relatedType: "booking",
        relatedId: booking._id
      });

      // Update lead state to inspection_scheduled
      await LeadModel.findOneAndUpdate(
        { clientId: booking.userId, propertyId: booking.propertyId },
        { $set: { status: "inspection_scheduled" } }
      );

      return bookingResponse(booking);
    },

    async rejectBooking(realtorId, bookingId) {
      const booking = await BookingModel.findOne({ _id: bookingId, realtorId });
      if (!booking) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found.");
      }

      if (booking.status !== "pending") {
        throw new ApiError(400, "INVALID_STATE", "Only pending bookings can be rejected.");
      }

      booking.status = "rejected";
      await booking.save();

      // Notify Client
      await NotificationModel.create({
        userId: booking.userId,
        type: "booking_updated",
        title: "Inspection Declined",
        message: "Your inspection booking request has been declined. Please request another time slot.",
        relatedType: "booking",
        relatedId: booking._id
      });

      return bookingResponse(booking);
    },

    async rescheduleBooking(realtorId, bookingId, { scheduledAt, timezone }) {
      const date = new Date(scheduledAt);
      if (!Number.isFinite(date.getTime()) || date <= new Date()) {
        throw new ApiError(400, "INVALID_DATE", "Scheduled time must be in the future.");
      }

      const booking = await BookingModel.findOne({ _id: bookingId, realtorId });
      if (!booking) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found.");
      }

      // Check conflict
      const conflict = await BookingModel.exists({
        realtorId,
        scheduledAt: date,
        status: { $in: ["confirmed"] },
        _id: { $ne: bookingId }
      });
      if (conflict) {
        throw new ApiError(409, "BOOKING_CONFLICT", "You already have a confirmed booking at this scheduled slot.");
      }

      // Record History
      booking.history.push({
        previousScheduledAt: booking.scheduledAt,
        rescheduledAt: date,
        rescheduledBy: "realtor",
        updatedAt: new Date()
      });

      booking.scheduledAt = date;
      if (timezone) booking.timezone = timezone;
      booking.status = "reschedule_requested";
      await booking.save();

      // Notify Client
      await NotificationModel.create({
        userId: booking.userId,
        type: "booking_updated",
        title: "Inspection Rescheduled",
        message: `The Realtor has proposed a new inspection time: ${date.toLocaleString()}. Please review and confirm.`,
        relatedType: "booking",
        relatedId: booking._id
      });

      return bookingResponse(booking);
    },

    async completeBooking(realtorId, bookingId) {
      const booking = await BookingModel.findOne({ _id: bookingId, realtorId });
      if (!booking) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "This booking was not found.");
      }

      if (booking.status !== "confirmed") {
        throw new ApiError(400, "INVALID_STATE", "Only previously confirmed bookings can be marked complete.");
      }

      booking.status = "completed";
      await booking.save();

      // Notify Client
      await NotificationModel.create({
        userId: booking.userId,
        type: "booking_updated",
        title: "Inspection Completed",
        message: "Thank you for attending the inspection! Let us know if you'd like to proceed.",
        relatedType: "booking",
        relatedId: booking._id
      });

      // Advance lead status to negotiating
      await LeadModel.findOneAndUpdate(
        { clientId: booking.userId, propertyId: booking.propertyId },
        { $set: { status: "negotiating" } }
      );

      return bookingResponse(booking);
    },

    // ----------------------------------------------------
    // MESSAGING
    // ----------------------------------------------------
    async getConversations(realtorId, { page, limit }) {
      const filter = { realtorId };

      const [items, totalItems] = await Promise.all([
        ConversationModel.find(filter)
          .populate("propertyId")
          .populate("clientId", "fullName avatar email phone")
          .populate("realtorId", "fullName avatar email phone")
          .sort({ lastMessageAt: -1, updatedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        ConversationModel.countDocuments(filter)
      ]);

      const output = await Promise.all(
        items.map(async (item) => {
          const unreadCount = await MessageModel.countDocuments({
            conversationId: item._id,
            senderId: { $ne: realtorId },
            "readBy.userId": { $not: { $eq: realtorId } }
          });
          return conversationResponse(item, unreadCount);
        })
      );

      return {
        items: output,
        pagination: paginationMeta(page, limit, totalItems)
      };
    },

    async getMessages(realtorId, conversationId, { page, limit }) {
      // Access control
      const conv = await ConversationModel.findOne({ _id: conversationId, realtorId }).lean();
      if (!conv) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Conversation unavailable.");
      }

      const filter = { conversationId };
      const [items, totalItems] = await Promise.all([
        MessageModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments(filter)
      ]);

      return {
        items: items.reverse().map(messageResponse),
        pagination: paginationMeta(page, limit, totalItems)
      };
    },

    async sendMessage(realtorId, conversationId, text) {
      const conv = await ConversationModel.findOne({ _id: conversationId, realtorId });
      if (!conv) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Conversation unavailable.");
      }

      const message = await MessageModel.create({
        conversationId,
        senderId: realtorId,
        text,
        type: "text",
        readBy: [{ userId: realtorId, readAt: new Date() }]
      });

      conv.lastMessageText = text.slice(0, 300);
      conv.lastMessageAt = message.createdAt;
      await conv.save();

      // Trigger/touch Lead as "contacted" on chat replies!
      await LeadModel.findOneAndUpdate(
        { clientId: conv.clientId, propertyId: conv.propertyId },
        { $set: { status: "contacted" } }
      );

      return messageResponse(message);
    },

    async markConversationRead(realtorId, conversationId) {
      const conv = await ConversationModel.exists({ _id: conversationId, realtorId });
      if (!conv) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Conversation unavailable.");
      }

      await MessageModel.updateMany(
        {
          conversationId,
          senderId: { $ne: realtorId },
          "readBy.userId": { $not: { $eq: realtorId } }
        },
        {
          $push: { readBy: { userId: realtorId, readAt: new Date() } }
        }
      );
    },

    // ----------------------------------------------------
    // PROFILE
    // ----------------------------------------------------
    async getProfile(realtorId) {
      const user = await UserModel.findById(realtorId).lean();
      if (!user) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Realtor profile not found.");
      }
      return sanitizeProfile(user);
    },

    async updateProfile(realtorId, data) {
      const user = await UserModel.findById(realtorId);
      if (!user) {
        throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Realtor profile not found.");
      }

      const { fullName, phone, bio, agency, specialties, serviceAreas } = data;

      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (agency !== undefined) user.agency = agency;
      if (specialties !== undefined) user.specialties = specialties;
      if (serviceAreas !== undefined) user.serviceAreas = serviceAreas;

      await user.save();
      return sanitizeProfile(user);
    }
  };
}
