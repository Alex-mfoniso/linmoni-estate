# Client profile

Firebase remains the authentication authority. MongoDB remains the role, status, and application-profile authority. The existing Phase B profile API is reused for the Client Profile tab.

Clients may update only safe presentation fields accepted by the profile validator. Firebase UID, email authority, role, status, password state, and internal timestamps cannot be changed through profile input. Profile provides navigation to Saved Properties, My Bookings, and Notifications and remains the fourth visible tab.
