import { successResponse } from "../utils/sanitizeResponse.js";

export function createRealtorController(realtorService) {
  return {
    async getDashboard(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const data = await realtorService.getDashboard(realtorId);
        return successResponse(res, "Realtor dashboard retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getProperties(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { page, limit, status, search } = req.validated.query;
        const data = await realtorService.getProperties(realtorId, { page, limit, status, search });
        return successResponse(res, "Realtor properties retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getPropertyDetail(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { propertyId } = req.params;
        const data = await realtorService.getPropertyDetail(realtorId, propertyId);
        return successResponse(res, "Property detail retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async createProperty(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const data = await realtorService.createProperty(realtorId, req.validated.body);
        return successResponse(res, "Property listing created successfully.", data, 201);
      } catch (err) {
        next(err);
      }
    },

    async updateProperty(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { propertyId } = req.validated.params;
        const data = await realtorService.updateProperty(realtorId, propertyId, req.validated.body);
        return successResponse(res, "Property listing updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async archiveProperty(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { propertyId } = req.params;
        const data = await realtorService.archiveProperty(realtorId, propertyId);
        return successResponse(res, "Property listing archived.", data);
      } catch (err) {
        next(err);
      }
    },

    async getLeads(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { page, limit, status } = req.query; // safe defaults can be used
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "20", 10);
        const data = await realtorService.getLeads(realtorId, { page: pageNum, limit: limitNum, status });
        return successResponse(res, "Leads list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getLeadDetail(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { leadId } = req.params;
        const data = await realtorService.getLeadDetail(realtorId, leadId);
        return successResponse(res, "Lead details retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async updateLead(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { leadId } = req.validated.params;
        const data = await realtorService.updateLead(realtorId, leadId, req.validated.body);
        return successResponse(res, "Lead updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async getBookings(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { page, limit, status } = req.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "20", 10);
        const data = await realtorService.getBookings(realtorId, { page: pageNum, limit: limitNum, status });
        return successResponse(res, "Bookings list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getBookingDetail(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { bookingId } = req.params;
        const data = await realtorService.getBookingDetail(realtorId, bookingId);
        return successResponse(res, "Booking details retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async confirmBooking(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { bookingId } = req.params;
        const data = await realtorService.confirmBooking(realtorId, bookingId);
        return successResponse(res, "Booking confirmed successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async rejectBooking(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { bookingId } = req.params;
        const data = await realtorService.rejectBooking(realtorId, bookingId);
        return successResponse(res, "Booking declined.", data);
      } catch (err) {
        next(err);
      }
    },

    async rescheduleBooking(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { bookingId } = req.validated.params;
        const data = await realtorService.rescheduleBooking(realtorId, bookingId, req.validated.body);
        return successResponse(res, "Booking rescheduled request sent.", data);
      } catch (err) {
        next(err);
      }
    },

    async completeBooking(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { bookingId } = req.params;
        const data = await realtorService.completeBooking(realtorId, bookingId);
        return successResponse(res, "Booking marked complete.", data);
      } catch (err) {
        next(err);
      }
    },

    async getProfile(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const data = await realtorService.getProfile(realtorId);
        return successResponse(res, "Realtor profile retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async updateProfile(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const data = await realtorService.updateProfile(realtorId, req.validated.body);
        return successResponse(res, "Profile updated successfully.", data);
      } catch (err) {
        next(err);
      }
    },

    async getConversations(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { page, limit } = req.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "20", 10);
        const data = await realtorService.getConversations(realtorId, { page: pageNum, limit: limitNum });
        return successResponse(res, "Conversations list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async getMessages(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { conversationId } = req.params;
        const { page, limit } = req.query;
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "20", 10);
        const data = await realtorService.getMessages(realtorId, conversationId, { page: pageNum, limit: limitNum });
        return successResponse(res, "Messages list retrieved.", data);
      } catch (err) {
        next(err);
      }
    },

    async sendMessage(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { conversationId } = req.params;
        const { text } = req.body;
        const data = await realtorService.sendMessage(realtorId, conversationId, text);
        return successResponse(res, "Message sent.", data, 201);
      } catch (err) {
        next(err);
      }
    },

    async markConversationRead(req, res, next) {
      try {
        const realtorId = req.userDocument._id;
        const { conversationId } = req.params;
        await realtorService.markConversationRead(realtorId, conversationId);
        return successResponse(res, "Conversation marked read.", {});
      } catch (err) {
        next(err);
      }
    }
  };
}
