# Notifications

Notifications are durable MongoDB records scoped to one authenticated user. Supported operations are paginated list, unread count, mark one read, mark all read, and delete one. Related resource type/id supports safe in-app navigation.

The Client notification screen uses the API, supports pull-to-refresh, and updates read/deleted state after confirmed writes. “Clear read” performs scoped deletes for the loaded read items. Other roles retain their existing Phase B notification implementation.
