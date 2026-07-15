import { ROLES } from "../constants/roles";

const DASHBOARD_CONTENT = {
  [ROLES.CLIENT]: {
    title: "Client Dashboard",
    subtitle: "Track your account, view progress, and stay on top of your estate journey.",
    stats: [
      { label: "Active Requests", value: "04", hint: "2 awaiting review" },
      { label: "Properties", value: "02", hint: "Saved to your list" },
      { label: "Notifications", value: "08", hint: "3 new today" },
    ],
    cards: [
      {
        eyebrow: "Today",
        icon: "C",
        title: "Visit reminders",
        description: "Your next scheduled viewing is ready and waiting in your account.",
      },
      {
        eyebrow: "Homes",
        icon: "P",
        title: "Browse properties",
        description: "Open the property catalog to search, filter, and view available listings.",
        route: "/(client)/properties",
      },
      {
        eyebrow: "Chat",
        icon: "M",
        title: "Messages",
        description: "Open your property conversations with realtors.",
        route: "/(client)/messages",
      },
      {
        eyebrow: "Bookings",
        icon: "B",
        title: "My bookings",
        description: "Open your inspection requests and keep track of what is pending.",
        route: "/(client)/bookings",
      },
      {
        eyebrow: "Updates",
        icon: "U",
        title: "Application progress",
        description: "See the latest status updates from the Linpal team at a glance.",
      },
      {
        eyebrow: "Saved",
        icon: "S",
        title: "Shortlisted homes",
        description: "Keep track of the places you want to revisit or share with family.",
        route: "/(client)/saved",
      },
    ],
  },
  [ROLES.REALTOR]: {
    title: "Realtor Dashboard",
    subtitle: "Review leads, follow up on listings, and keep every opportunity moving.",
    stats: [
      { label: "Active Leads", value: "12", hint: "5 hot prospects" },
      { label: "Listings", value: "09", hint: "2 newly published" },
      { label: "Open Tasks", value: "06", hint: "3 due today" },
    ],
    cards: [
      {
        eyebrow: "Pipeline",
        icon: "L",
        title: "Lead tracker",
        description: "Monitor every contact from first enquiry to final follow-up.",
      },
      {
        eyebrow: "Inventory",
        icon: "I",
        title: "My properties",
        description: "Open your property workspace to add, edit, or delete listings.",
        route: "/(realtor)/properties",
      },
      {
        eyebrow: "Chat",
        icon: "M",
        title: "Messages",
        description: "Reply to clients and keep property conversations moving.",
        route: "/(realtor)/messages",
      },
      {
        eyebrow: "Bookings",
        icon: "B",
        title: "Inspection bookings",
        description: "Review client inspection requests and update their status.",
        route: "/(realtor)/bookings",
      },
      {
        eyebrow: "Add",
        icon: "A",
        title: "Create listing",
        description: "Add a new property record and publish it to the shared catalog.",
        route: "/(realtor)/add-property",
      },
      {
        eyebrow: "Insights",
        icon: "T",
        title: "Market snapshot",
        description: "A quick look at activity trends and what needs attention next.",
      },
    ],
  },
  [ROLES.STAFF]: {
    title: "Staff Dashboard",
    subtitle: "Manage daily operations, respond quickly, and keep service running smoothly.",
    stats: [
      { label: "Open Tickets", value: "07", hint: "2 urgent" },
      { label: "Scheduled Jobs", value: "11", hint: "4 for today" },
      { label: "Team Updates", value: "05", hint: "1 unread memo" },
    ],
    cards: [
      {
        eyebrow: "Operations",
        icon: "T",
        title: "Task queue",
        description: "Prioritized jobs that keep the estate experience on track.",
      },
      {
        eyebrow: "Bookings",
        icon: "B",
        title: "Bookings",
        description: "See inspection requests and their current status.",
        route: "/(staff)/bookings",
      },
      {
        eyebrow: "Records",
        icon: "P",
        title: "Property records",
        description: "Open the shared property catalogue and review records.",
        route: "/(staff)/properties",
      },
      {
        eyebrow: "Chat",
        icon: "M",
        title: "Messages",
        description: "Follow up on conversations when access allows.",
        route: "/(staff)/messages",
      },
      {
        eyebrow: "Schedule",
        icon: "S",
        title: "Shift planning",
        description: "See what is happening today and who is assigned to each task.",
      },
      {
        eyebrow: "Notes",
        icon: "H",
        title: "Handovers",
        description: "Capture short updates so the next person can pick up cleanly.",
      },
    ],
  },
  [ROLES.STAKEHOLDER]: {
    title: "Stakeholder Dashboard",
    subtitle: "Get a fast read on portfolio activity, performance, and key updates.",
    stats: [
      { label: "Reports", value: "03", hint: "1 new summary" },
      { label: "Portfolio", value: "14", hint: "Across 3 phases" },
      { label: "Approvals", value: "02", hint: "Awaiting review" },
    ],
    cards: [
      {
        eyebrow: "Finance",
        icon: "F",
        title: "Performance overview",
        description: "High-level snapshots of progress, occupancy, and return trends.",
      },
      {
        eyebrow: "Strategy",
        icon: "P",
        title: "Project milestones",
        description: "Track what has landed and what still needs sign-off.",
      },
      {
        eyebrow: "Reports",
        icon: "R",
        title: "Monthly summaries",
        description: "Quick access to the latest estate updates and reporting packs.",
        route: "/(stakeholder)/analytics",
      },
      {
        eyebrow: "Insights",
        icon: "I",
        title: "Portfolio highlights",
        description: "A concise view of the most important things to know today.",
      },
    ],
  },
  [ROLES.ADMIN]: {
    title: "Admin Dashboard",
    subtitle: "Oversee users, roles, and the overall state of the platform.",
    stats: [
      { label: "Users", value: "24", hint: "5 pending approval" },
      { label: "Roles", value: "05", hint: "Fully provisioned" },
      { label: "Alerts", value: "02", hint: "Needs attention" },
    ],
    cards: [
      {
        eyebrow: "Control",
        icon: "U",
        title: "User management",
        description: "Review accounts, permissions, and access levels in one place.",
        route: "/(admin)/management",
      },
      {
        eyebrow: "Bookings",
        icon: "B",
        title: "All bookings",
        description: "Open every inspection request and manage it from one place.",
        route: "/(admin)/bookings",
      },
      {
        eyebrow: "Analytics",
        icon: "A",
        title: "Platform analytics",
        description: "Review the platform metrics and activity trends.",
        route: "/(admin)/analytics",
      },
      {
        eyebrow: "Property",
        icon: "P",
        title: "All properties",
        description: "Open the full property catalogue and manage any listing in the system.",
        route: "/(admin)/properties",
      },
    ],
  },
};

export function getDashboardContent(role) {
  return DASHBOARD_CONTENT[role] ?? DASHBOARD_CONTENT[ROLES.CLIENT];
}
