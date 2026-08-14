import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { getEnv } from "./config/env.js";
import { User } from "./models/User.js";
import { AuditLog } from "./models/AuditLog.js";
import { createLogger, createHttpLogger } from "./utils/logger.js";
import { createUserService } from "./services/userService.js";
import { createAuditService } from "./services/auditService.js";
import { createAuthController } from "./controllers/authController.js";
import { createAuthenticateJwt } from "./middleware/authenticateJwt.js";
import { createRequireProfile } from "./middleware/requireProfile.js";
import { generalLimiter } from "./middleware/rateLimiters.js";
import { createHealthRouter } from "./routes/healthRoutes.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";
import { ERROR_CODES } from "./constants/errorCodes.js";
import { Property } from "./models/Property.js";
import { Favourite } from "./models/Favourite.js";
import { Booking } from "./models/Booking.js";
import { Conversation } from "./models/Conversation.js";
import { Message } from "./models/Message.js";
import { Notification } from "./models/Notification.js";
import { Lead } from "./models/Lead.js";
import { requireActiveAccount } from "./middleware/requireActiveAccount.js";
import { authorizeRoles } from "./middleware/authorizeRoles.js";
import { createPropertyService } from "./services/propertyService.js";
import { createFavouriteService } from "./services/favouriteService.js";
import { createBookingService } from "./services/bookingService.js";
import { createConversationService } from "./services/conversationService.js";
import { createNotificationService } from "./services/notificationService.js";
import { createClientHomeService } from "./services/clientHomeService.js";
import { createRealtorService } from "./services/realtorService.js";
import { createPropertyController } from "./controllers/propertyController.js";
import { createFavouriteController } from "./controllers/favouriteController.js";
import { createBookingController } from "./controllers/bookingController.js";
import { createConversationController } from "./controllers/conversationController.js";
import { createNotificationController } from "./controllers/notificationController.js";
import { createClientHomeController } from "./controllers/clientHomeController.js";
import { createRealtorController } from "./controllers/realtorController.js";
import { createPropertyRouter } from "./routes/propertyRoutes.js";
import { createFavouriteRouter } from "./routes/favouriteRoutes.js";
import { createBookingRouter } from "./routes/bookingRoutes.js";
import { createConversationRouter } from "./routes/conversationRoutes.js";
import { createNotificationRouter } from "./routes/notificationRoutes.js";
import { createProfileRouter } from "./routes/profileRoutes.js";
import { createClientHomeRouter } from "./routes/clientHomeRoutes.js";
import { createRealtorRouter } from "./routes/realtorRoutes.js";
import { Task } from "./models/Task.js";
import { Issue } from "./models/Issue.js";
import { Review } from "./models/Review.js";
import { createStaffService } from "./services/staffService.js";
import { createStaffController } from "./controllers/staffController.js";
import { createStaffRouter } from "./routes/staffRoutes.js";
import { createStakeholderService } from "./services/stakeholderService.js";
import { createStakeholderController } from "./controllers/stakeholderController.js";
import { createStakeholderRouter } from "./routes/stakeholderRoutes.js";
import { PlatformSetting } from "./models/PlatformSettings.js";
import { createAdminService } from "./services/adminService.js";
import { createAdminController } from "./controllers/adminController.js";
import { createAdminRouter } from "./routes/adminRoutes.js";

export function createApp(options = {}) {
  const config = options.config || getEnv(); const logger = options.logger || createLogger(config.LOG_LEVEL);
  const userService = options.userService || createUserService(options.UserModel || User); const auditService = options.auditService || createAuditService(options.AuditLogModel || AuditLog, logger);
  const controller = createAuthController({ userService, auditService }); const authenticate = createAuthenticateJwt(config, options.adminAuth); const requireProfile = createRequireProfile(userService);
  const models = { PropertyModel: options.PropertyModel || Property, FavouriteModel: options.FavouriteModel || Favourite, BookingModel: options.BookingModel || Booking, ConversationModel: options.ConversationModel || Conversation, MessageModel: options.MessageModel || Message, NotificationModel: options.NotificationModel || Notification, LeadModel: options.LeadModel || Lead };
  const propertyService = options.propertyService || createPropertyService(models.PropertyModel);
  const favouriteService = options.favouriteService || createFavouriteService({ FavouriteModel: models.FavouriteModel, PropertyModel: models.PropertyModel });
  const bookingService = options.bookingService || createBookingService({ BookingModel: models.BookingModel, PropertyModel: models.PropertyModel });
  const conversationService = options.conversationService || createConversationService({ ConversationModel: models.ConversationModel, MessageModel: models.MessageModel, PropertyModel: models.PropertyModel });
  const notificationService = options.notificationService || createNotificationService(models.NotificationModel);
  const clientHomeService = options.clientHomeService || createClientHomeService({ propertyService, favouriteService, bookingService, conversationService, notificationService });
  
  const realtorService = options.realtorService || createRealtorService({
    UserModel: options.UserModel || User,
    PropertyModel: models.PropertyModel,
    BookingModel: models.BookingModel,
    LeadModel: models.LeadModel,
    ConversationModel: models.ConversationModel,
    MessageModel: models.MessageModel,
    NotificationModel: models.NotificationModel
  });
  const realtorController = createRealtorController(realtorService);
  const realtorRouter = createRealtorRouter({
    guards: [authenticate, requireProfile, requireActiveAccount, authorizeRoles("realtor")],
    controller: realtorController
  });

  const staffService = options.staffService || createStaffService({
    UserModel: options.UserModel || User,
    PropertyModel: models.PropertyModel,
    BookingModel: models.BookingModel,
    TaskModel: options.TaskModel || Task,
    IssueModel: options.IssueModel || Issue,
    ReviewModel: options.ReviewModel || Review,
    NotificationModel: models.NotificationModel,
    AuditLogModel: options.AuditLogModel || AuditLog,
    logger
  });
  const staffController = createStaffController({ staffService, auditService });
  const staffRouter = createStaffRouter({
    guards: [authenticate, requireProfile, requireActiveAccount, authorizeRoles("staff")],
    controller: staffController
  });

  const stakeholderService = options.stakeholderService || createStakeholderService({
    UserModel: options.UserModel || User,
    PropertyModel: models.PropertyModel,
    BookingModel: models.BookingModel,
    LeadModel: models.LeadModel,
    AuditLogModel: options.AuditLogModel || AuditLog,
    IssueModel: options.IssueModel || Issue,
    ReviewModel: options.ReviewModel || Review,
    logger
  });
  const stakeholderController = createStakeholderController({ stakeholderService, auditService });
  const stakeholderRouter = createStakeholderRouter({
    guards: [authenticate, requireProfile, requireActiveAccount, authorizeRoles("stakeholder")],
    controller: stakeholderController
  });

  const adminService = options.adminService || createAdminService({
    UserModel: options.UserModel || User,
    PropertyModel: models.PropertyModel,
    BookingModel: models.BookingModel,
    IssueModel: options.IssueModel || Issue,
    AuditLogModel: options.AuditLogModel || AuditLog,
    PlatformSettingModel: options.PlatformSettingModel || PlatformSetting
  });
  const adminController = createAdminController({
    adminService
  });
  const adminRouter = createAdminRouter({
    guards: [authenticate, requireProfile, requireActiveAccount, authorizeRoles("admin")],
    controller: adminController
  });

  const guards = [authenticate, requireProfile, requireActiveAccount, authorizeRoles("client")];
  const allowed = new Set(config.CLIENT_ORIGINS); const app = express(); app.disable("x-powered-by"); app.use(createHttpLogger(logger)); app.use(helmet());
  app.use(cors({ origin(origin, callback) { if (!origin || allowed.has(origin)) return callback(null, true); return callback(new ApiError(403, ERROR_CODES.ROLE_FORBIDDEN, "This origin is not permitted.")); }, credentials: false }));
  app.use(compression()); app.use(express.json({ limit: "100kb" })); app.use(express.urlencoded({ extended: false, limit: "100kb" })); app.use(generalLimiter);
  app.use("/api/health", createHealthRouter(config));
  app.use("/api/v1/auth", createAuthRouter({ authenticate, requireProfile, controller }));
  app.use("/api/v1/properties", createPropertyRouter({ guards, controller: createPropertyController(propertyService) }));
  app.use("/api/v1/favourites", createFavouriteRouter({ guards, controller: createFavouriteController(favouriteService) }));
  app.use("/api/v1/bookings", createBookingRouter({ guards, controller: createBookingController(bookingService) }));
  app.use("/api/v1/conversations", createConversationRouter({ guards, controller: createConversationController(conversationService) }));
  app.use("/api/v1/notifications", createNotificationRouter({ guards, controller: createNotificationController(notificationService) }));
  app.use("/api/v1/profile", createProfileRouter({ guards, controller }));
  app.use("/api/v1/client/home", createClientHomeRouter({ guards, controller: createClientHomeController(clientHomeService) }));
  app.use("/api/v1/realtor", realtorRouter);
  app.use("/api/v1/staff", staffRouter);
  app.use("/api/v1/stakeholder", stakeholderRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use(notFound); app.use(errorHandler); return app;
}
