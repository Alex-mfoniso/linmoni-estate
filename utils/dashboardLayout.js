import { ROLES } from "../constants/roles";

function minutesAgo(value) {
  return new Date(Date.now() - value * 60 * 1000).toISOString();
}

function hoursAgo(value) {
  return new Date(Date.now() - value * 60 * 60 * 1000).toISOString();
}

function daysAgo(value) {
  return new Date(Date.now() - value * 24 * 60 * 60 * 1000).toISOString();
}

const SHARED_SUMMARIES = {
  [ROLES.CLIENT]: {
    title: "Client Dashboard",
    subtitle: "A compact view of your estate journey, bookings, and saved homes.",
    stats: [
      { label: "Active Requests", value: "04", hint: "2 awaiting review" },
      { label: "Saved Properties", value: "12", hint: "3 new this week" },
      { label: "Messages", value: "08", hint: "4 unread replies" },
      { label: "Notifications", value: "03", hint: "1 needs attention" },
    ],
    sections: [
      {
        key: "activity",
        title: "Recent Activity",
        subtitle: "Latest updates from your account",
        type: "timeline",
        items: [
          {
            icon: "M",
            title: "Realtor replied to your enquiry",
            description: "A new message came in for Coral Ridge Estate.",
            createdAt: minutesAgo(18),
          },
          {
            icon: "B",
            title: "Inspection request submitted",
            description: "Your viewing request is now waiting for review.",
            createdAt: hoursAgo(2),
          },
          {
            icon: "S",
            title: "Property saved",
            description: "You added three-bedroom duplexes to your shortlist.",
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        key: "upcoming",
        title: "Upcoming Inspection",
        subtitle: "Your next visit at a glance",
        type: "upcoming",
        item: {
          title: "Coral Vista Apartment",
          description: "Confirmed with the realtor and ready for your visit.",
          dateLabel: "Tue, 16 Jul",
          timeLabel: "10:30 AM",
          badge: "Confirmed",
          actionLabel: "View booking",
        },
      },
      {
        key: "recommended",
        title: "Recommended Properties",
        subtitle: "Listings that match your recent activity",
        type: "horizontal",
        items: [
          {
            title: "Pearl Garden Duplex",
            description: "Lekki Phase 1",
            value: "NGN120M",
            badge: "Available",
            meta: "4 bed / 5 bath",
          },
          {
            title: "Azure Court Apartment",
            description: "Yaba, Lagos",
            value: "NGN68M",
            badge: "Hot",
            meta: "3 bed / 3 bath",
          },
          {
            title: "Sage Terraces",
            description: "Ikeja GRA",
            value: "NGN95M",
            badge: "New",
            meta: "4 bed / 4 bath",
          },
        ],
      },
      {
        key: "actions",
        title: "Quick Actions",
        subtitle: "Jump straight to the most used areas",
        type: "grid",
        items: [
          {
            title: "Browse Properties",
            description: "Search and filter every listing.",
            icon: "P",
            onPress: null,
            route: "/(client)/properties",
          },
          {
            title: "My Bookings",
            description: "Review inspections and requests.",
            icon: "B",
            route: "/(client)/bookings",
          },
          {
            title: "Messages",
            description: "Continue conversations with realtors.",
            icon: "M",
            route: "/(client)/messages",
          },
          {
            title: "Saved Properties",
            description: "Open your shortlist and favourites.",
            icon: "S",
            route: "/(client)/saved",
          },
        ],
      },
    ],
  },
  [ROLES.REALTOR]: {
    title: "Realtor Dashboard",
    subtitle: "Keep listings moving, follow up faster, and stay on top of bookings.",
    stats: [
      { label: "Properties", value: "09", hint: "2 recently updated" },
      { label: "Pending Bookings", value: "04", hint: "2 for today" },
      { label: "Messages", value: "12", hint: "5 unread replies" },
      { label: "Active Listings", value: "06", hint: "Publishing now" },
    ],
    sections: [
      {
        key: "schedule",
        title: "Today's Schedule",
        subtitle: "What needs your attention now",
        type: "upcoming",
        item: {
          title: "Site visit at Palm Crest",
          description: "Three client showings lined up for the afternoon.",
          dateLabel: "Today",
          timeLabel: "1:00 PM",
          badge: "Busy",
          actionLabel: "Open bookings",
        },
      },
      {
        key: "leads",
        title: "Recent Leads",
        subtitle: "The newest opportunities in your pipeline",
        type: "timeline",
        items: [
          {
            icon: "L",
            title: "Ada requested a viewing",
            description: "Interested in the Azura duplex listing.",
            createdAt: minutesAgo(32),
          },
          {
            icon: "M",
            title: "Michael asked about payment plan",
            description: "Follow-up needed on the Skyview terrace.",
            createdAt: hoursAgo(3),
          },
          {
            icon: "R",
            title: "Lead converted to inspection",
            description: "Pearl Garden Duplex is now awaiting confirmation.",
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        key: "recent-properties",
        title: "Recently Added Properties",
        subtitle: "Fresh listings you may want to revisit",
        type: "horizontal",
        items: [
          {
            title: "Lagoon View Terrace",
            description: "Victoria Island",
            value: "NGN145M",
            badge: "New",
            meta: "4 bed / 4 bath",
          },
          {
            title: "Emerald Court",
            description: "Ikeja GRA",
            value: "NGN84M",
            badge: "Live",
            meta: "3 bed / 3 bath",
          },
          {
            title: "Bluewater Residence",
            description: "Lekki Phase 1",
            value: "NGN210M",
            badge: "Featured",
            meta: "5 bed / 6 bath",
          },
        ],
      },
      {
        key: "actions",
        title: "Quick Actions",
        subtitle: "Launch the most common realtor tasks",
        type: "grid",
        items: [
          {
            title: "Add Property",
            description: "Create a new listing in one tap.",
            icon: "A",
            route: "/(realtor)/add-property",
          },
          {
            title: "Bookings",
            description: "See and manage inspection requests.",
            icon: "B",
            route: "/(realtor)/bookings",
          },
          {
            title: "Messages",
            description: "Keep client conversations moving.",
            icon: "M",
            route: "/(realtor)/messages",
          },
          {
            title: "Analytics",
            description: "Review performance summaries.",
            icon: "X",
            route: "/(realtor)/more",
          },
        ],
      },
    ],
  },
  [ROLES.STAFF]: {
    title: "Staff Dashboard",
    subtitle: "Work the queue, clear approvals, and keep operations moving quickly.",
    stats: [
      { label: "Today's Bookings", value: "07", hint: "3 scheduled soon" },
      { label: "Pending Approvals", value: "05", hint: "2 urgent" },
      { label: "Properties", value: "12", hint: "4 under review" },
      { label: "Messages", value: "05", hint: "1 unread memo" },
    ],
    sections: [
      {
        key: "tasks",
        title: "Today's Tasks",
        subtitle: "Compact list of the work in front of you",
        type: "list",
        items: [
          {
            icon: "1",
            title: "Verify inspection schedule",
            description: "Confirm the afternoon slots for the client bookings desk.",
            createdAt: minutesAgo(24),
            meta: "High priority",
          },
          {
            icon: "2",
            title: "Approve two property updates",
            description: "Review the latest edits pushed by the realtor team.",
            createdAt: hoursAgo(4),
            meta: "Due today",
          },
          {
            icon: "3",
            title: "Reply to support messages",
            description: "Clear unanswered conversations before close of business.",
            createdAt: hoursAgo(7),
            meta: "Queue",
          },
        ],
      },
      {
        key: "requests",
        title: "Recent Requests",
        subtitle: "Fresh items coming through operations",
        type: "timeline",
        items: [
          {
            icon: "B",
            title: "Client requested booking change",
            description: "A new preferred time was submitted for review.",
            createdAt: minutesAgo(40),
          },
          {
            icon: "P",
            title: "Property record update pending",
            description: "One listing needs a quick verification pass.",
            createdAt: hoursAgo(2),
          },
          {
            icon: "M",
            title: "Message escalation received",
            description: "Support team needs a timely response on access rules.",
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        key: "actions",
        title: "Quick Actions",
        subtitle: "Fast access to staff workflows",
        type: "grid",
        items: [
          {
            title: "Bookings",
            description: "Open the inspection workflow.",
            icon: "B",
            route: "/(staff)/bookings",
          },
          {
            title: "Properties",
            description: "Review the shared catalogue.",
            icon: "P",
            route: "/(staff)/properties",
          },
          {
            title: "Messages",
            description: "Respond to ongoing conversations.",
            icon: "M",
            route: "/(staff)/messages",
          },
          {
            title: "Reports",
            description: "Use staff tools and summaries.",
            icon: "R",
            route: "/(staff)/more",
          },
        ],
      },
    ],
  },
  [ROLES.STAKEHOLDER]: {
    title: "Stakeholder Dashboard",
    subtitle: "A concise business read on properties, bookings, and portfolio health.",
    stats: [
      { label: "Properties", value: "14", hint: "3 active projects" },
      { label: "Occupied", value: "10", hint: "71% occupancy" },
      { label: "Available", value: "04", hint: "Ready to market" },
      { label: "Bookings", value: "06", hint: "2 awaiting review" },
    ],
    sections: [
      {
        key: "analytics",
        title: "Analytics Preview",
        subtitle: "High-level portfolio snapshot",
        type: "insight",
        item: {
          title: "Portfolio health",
          description: "Occupancy is holding steady and bookings are trending up.",
          value: "92%",
          badge: "Stable",
          meta: "Up 8% from last month",
        },
      },
      {
        key: "activity",
        title: "Recent Property Activity",
        subtitle: "The latest changes across the portfolio",
        type: "timeline",
        items: [
          {
            icon: "P",
            title: "Two units marked available",
            description: "The marketing team released updated availability.",
            createdAt: minutesAgo(28),
          },
          {
            icon: "B",
            title: "Booking approvals increased",
            description: "Inspection volume is up compared with last week.",
            createdAt: hoursAgo(3),
          },
          {
            icon: "R",
            title: "Quarterly summary prepared",
            description: "Latest reports are ready for review.",
            createdAt: daysAgo(2),
          },
        ],
      },
      {
        key: "projects",
        title: "Projects",
        subtitle: "A compact view of active estate phases",
        type: "horizontal",
        items: [
          {
            title: "Phase One",
            description: "Lekki waterfront cluster",
            value: "83% complete",
            badge: "Active",
            meta: "3 plots left",
          },
          {
            title: "Phase Two",
            description: "Ikoyi residential block",
            value: "64% complete",
            badge: "Monitoring",
            meta: "2 approvals pending",
          },
          {
            title: "Phase Three",
            description: "Ibeju-Lekki villas",
            value: "91% complete",
            badge: "On track",
            meta: "Handover soon",
          },
        ],
      },
      {
        key: "actions",
        title: "Reports Shortcut",
        subtitle: "Jump straight to the review area",
        type: "grid",
        items: [
          {
            title: "Reports",
            description: "Open the analytics tab.",
            icon: "R",
            route: "/(stakeholder)/analytics",
          },
          {
            title: "Properties",
            description: "Review the full portfolio.",
            icon: "P",
            route: "/(stakeholder)/properties",
          },
          {
            title: "Profile",
            description: "Check account details.",
            icon: "U",
            route: "/(stakeholder)/profile",
          },
          {
            title: "More",
            description: "Additional account tools.",
            icon: "M",
            route: "/(stakeholder)/more",
          },
        ],
      },
    ],
  },
  [ROLES.ADMIN]: {
    title: "Admin Dashboard",
    subtitle: "Monitor users, properties, bookings, and platform health in one place.",
    stats: [
      { label: "Users", value: "24", hint: "5 pending approval" },
      { label: "Properties", value: "32", hint: "4 updated today" },
      { label: "Bookings", value: "16", hint: "6 awaiting action" },
      { label: "Messages", value: "11", hint: "3 new alerts" },
    ],
    sections: [
      {
        key: "analytics",
        title: "Analytics Preview",
        subtitle: "A glance at platform activity",
        type: "insight",
        item: {
          title: "System activity",
          description: "User growth is healthy and booking throughput is steady.",
          value: "98%",
          badge: "Operational",
          meta: "Response time within target",
        },
      },
      {
        key: "activities",
        title: "Recent Activities",
        subtitle: "What changed most recently",
        type: "timeline",
        items: [
          {
            icon: "U",
            title: "New user registered",
            description: "A client account was created a few minutes ago.",
            createdAt: minutesAgo(12),
          },
          {
            icon: "P",
            title: "Property approved",
            description: "A realtor listing was published to the catalog.",
            createdAt: hoursAgo(2),
          },
          {
            icon: "B",
            title: "Booking status updated",
            description: "A request moved from pending to approved.",
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        key: "shortcuts",
        title: "Management Shortcuts",
        subtitle: "Navigate directly to the most used admin areas",
        type: "grid",
        items: [
          {
            title: "Users",
            description: "Review accounts and permissions.",
            icon: "U",
            route: "/(admin)/users",
          },
          {
            title: "Properties",
            description: "Open the property catalogue.",
            icon: "P",
            route: "/(admin)/properties",
          },
          {
            title: "Bookings",
            description: "Track all inspection requests.",
            icon: "B",
            route: "/(admin)/bookings",
          },
          {
            title: "Reports",
            description: "See the platform analytics tab.",
            icon: "R",
            route: "/(admin)/analytics",
          },
        ],
      },
      {
        key: "registrations",
        title: "Latest Registrations",
        subtitle: "Fresh accounts that need a quick look",
        type: "list",
        items: [
          {
            icon: "C",
            title: "Chinaza Okafor",
            description: "Client account activated and awaiting review.",
            createdAt: minutesAgo(25),
            meta: "Client",
          },
          {
            icon: "R",
            title: "Rebecca I.",
            description: "Realtor profile created successfully.",
            createdAt: hoursAgo(4),
            meta: "Realtor",
          },
          {
            icon: "S",
            title: "Support staff added",
            description: "New internal account is ready for onboarding.",
            createdAt: daysAgo(1),
            meta: "Staff",
          },
        ],
      },
    ],
  },
};

export function getDashboardLayout(role) {
  return SHARED_SUMMARIES[role] ?? SHARED_SUMMARIES[ROLES.CLIENT];
}
