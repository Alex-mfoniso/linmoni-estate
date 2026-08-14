import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Switch
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { adminApi } from "../../services/adminApi";
import { useAuth } from "../../contexts/AuthContext";

const PANELS = [
  { id: "users", label: "Users", icon: "people-outline" },
  { id: "properties", label: "Properties", icon: "business-outline" },
  { id: "provision", label: "Create Account", icon: "person-add-outline" },
  { id: "settings", label: "Settings", icon: "options-outline" }
];

export default function AdminManagementScreen() {
  const { userProfile } = useAuth();
  const [activePanel, setActivePanel] = useState("users");
  const [loading, setLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState(""); // Status filter state
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserPageHasMore] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null); // Rich detail storage
  const [loadingUserDetail, setLoadingUserDetail] = useState(false); // Detail loading state
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userActionReason, setUserActionReason] = useState("");

  // Properties State
  const [properties, setProperties] = useState([]);
  const [propSearch, setPropSearch] = useState("");
  const [propStatusFilter, setPropStatusFilter] = useState("");
  const [propPage, setPropPage] = useState(1);
  const [selectedProp, setSelectedProp] = useState(null);
  const [propModalVisible, setPropModalVisible] = useState(false);
  const [propActionReason, setPropActionReason] = useState("");

  // Dynamic Unified Account Onboarding States
  const [onboardRole, setOnboardRole] = useState("stakeholder");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardFullName, setOnboardFullName] = useState("");
  const [onboardPhone, setOnboardPhone] = useState("");
  const [onboardPassword, setOnboardPassword] = useState("");
  const [onboardAgency, setOnboardAgency] = useState("");
  const [onboardSpecialties, setOnboardSpecialties] = useState("");
  const [onboardServiceAreas, setOnboardServiceAreas] = useState("");
  const [onboardDepartment, setOnboardDepartment] = useState("");
  const [onboardPosition, setOnboardPosition] = useState("");

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    amenities: [],
    maintenanceMode: false,
    listingsApprovalRequired: true
  });
  const [newAmenity, setNewAmenity] = useState("");

  // Fetch Panel Data
  const loadUsers = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const page = reset ? 1 : userPage;
      const res = await adminApi.getUsers({
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter, // Status filter integration
        page,
        limit: 15
      });
      if (res.success) {
        if (reset) {
          setUsers(res.data);
          setUserPage(2);
        } else {
          setUsers(prev => [...prev, ...res.data]);
          setUserPage(prev => prev + 1);
        }
        setUserPageHasMore(res.data.length === 15);
      }
    } catch (err) {
      console.warn("Failed loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [userSearch, userRoleFilter, userStatusFilter, userPage]);

  // Fetch full details of a clicked user dynamically
  const handleUserCardPress = async (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
    setLoadingUserDetail(true);
    setSelectedUserDetail(null);
    try {
      const res = await adminApi.getUserDetail(user._id);
      if (res.success) {
        setSelectedUserDetail(res.data);
      }
    } catch (err) {
      console.warn("Failed loading user details:", err);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const loadProperties = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const page = reset ? 1 : propPage;
      const res = await adminApi.getProperties({
        search: propSearch,
        status: propStatusFilter,
        page,
        limit: 15
      });
      if (res.success) {
        if (reset) {
          setProperties(res.data);
          setPropPage(2);
        } else {
          setProperties(prev => [...prev, ...res.data]);
          setPropPage(prev => prev + 1);
        }
      }
    } catch (err) {
      console.warn("Failed loading properties:", err);
    } finally {
      setLoading(false);
    }
  }, [propSearch, propStatusFilter, propPage]);

  const loadPlatformSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPlatformSettings();
      if (res.success && res.data) {
        setPlatformSettings(res.data);
      }
    } catch (err) {
      console.warn("Failed loading settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activePanel === "users") loadUsers(true);
      if (activePanel === "properties") loadProperties(true);
      if (activePanel === "settings") loadPlatformSettings();
    }, [activePanel])
  );

  // Trigger filters resets with immediate live reloading
  const handleUserFilterChange = (role) => {
    setUserRoleFilter(role);
    setUserPage(1);
    setUsers([]);
    setLoading(true);
    adminApi.getUsers({
      search: userSearch,
      role,
      status: userStatusFilter,
      page: 1,
      limit: 15
    })
      .then(res => {
        if (res.success) {
          setUsers(res.data);
          setUserPage(2);
          setUserPageHasMore(res.data.length === 15);
        }
      })
      .catch(err => console.warn("Failed filtering users:", err))
      .finally(() => setLoading(false));
  };

  const handleUserStatusFilterChange = (status) => {
    setUserStatusFilter(status);
    setUserPage(1);
    setUsers([]);
    setLoading(true);
    adminApi.getUsers({
      search: userSearch,
      role: userRoleFilter,
      status,
      page: 1,
      limit: 15
    })
      .then(res => {
        if (res.success) {
          setUsers(res.data);
          setUserPage(2);
          setUserPageHasMore(res.data.length === 15);
        }
      })
      .catch(err => console.warn("Failed filtering users by status:", err))
      .finally(() => setLoading(false));
  };

  const handlePropFilterChange = (status) => {
    setPropStatusFilter(status);
    setPropPage(1);
    setProperties([]);
    setLoading(true);
    adminApi.getProperties({
      search: propSearch,
      status,
      page: 1,
      limit: 15
    })
      .then(res => {
        if (res.success) {
          setProperties(res.data);
          setPropPage(2);
        }
      })
      .catch(err => console.warn("Failed filtering properties:", err))
      .finally(() => setLoading(false));
  };

  // User Actions Executions
  const triggerUserStatus = async (status) => {
    if (!userActionReason.trim() || userActionReason.trim().length < 5) {
      Alert.alert("Reason Required", "Please enter an auditing reason of at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.updateUserStatus(selectedUser._id, status, userActionReason);
      Alert.alert(res.success ? "Success" : "Error", res.message || "Operation failed.");
      if (res.success) {
        setUserModalVisible(false);
        setUserActionReason("");
        loadUsers(true);
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed changing user status.");
    } finally {
      setLoading(false);
    }
  };

  const triggerUserRole = async (role) => {
    if (!userActionReason.trim() || userActionReason.trim().length < 5) {
      Alert.alert("Reason Required", "Please enter an auditing reason of at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.updateUserRole(selectedUser._id, role, userActionReason);
      Alert.alert(res.success ? "Success" : "Error", res.message || "Operation failed.");
      if (res.success) {
        setUserModalVisible(false);
        setUserActionReason("");
        loadUsers(true);
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed changing user role.");
    } finally {
      setLoading(false);
    }
  };

  // Property Actions Executions
  const triggerPropStatus = async (status) => {
    setLoading(true);
    try {
      const res = await adminApi.updatePropertyStatus(selectedProp._id, status, propActionReason || "Admin status update");
      Alert.alert(res.success ? "Success" : "Error", res.message || "Operation failed.");
      if (res.success) {
        setPropModalVisible(false);
        setPropActionReason("");
        loadProperties(true);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerPropDelete = async () => {
    Alert.alert(
      "Confirm Soft Deletion",
      "Are you sure you want to soft-delete (archive) this property listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await adminApi.deleteProperty(selectedProp._id, propActionReason || "Administrative soft-delete");
              Alert.alert(res.success ? "Success" : "Error", res.message);
              if (res.success) {
                setPropModalVisible(false);
                setPropActionReason("");
                loadProperties(true);
              }
            } catch (err) {
              Alert.alert("Error", err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Unified Account Provisioning Submission
  const triggerProvisionUser = async () => {
    if (!onboardFullName || !onboardEmail || !onboardPassword) {
      Alert.alert("Missing Fields", "Please populate full name, email, and password.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        role: onboardRole,
        fullName: onboardFullName.trim(),
        email: onboardEmail.trim().toLowerCase(),
        password: onboardPassword
      };

      if (onboardPhone && onboardPhone.trim()) {
        payload.phone = onboardPhone.trim();
      }

      if (onboardRole === "realtor") {
        if (onboardAgency && onboardAgency.trim()) payload.agency = onboardAgency.trim();
        payload.specialties = onboardSpecialties ? onboardSpecialties.split(",").map(s => s.trim()).filter(Boolean) : [];
        payload.serviceAreas = onboardServiceAreas ? onboardServiceAreas.split(",").map(s => s.trim()).filter(Boolean) : [];
      } else if (onboardRole === "staff") {
        if (onboardDepartment && onboardDepartment.trim()) payload.department = onboardDepartment.trim();
        if (onboardPosition && onboardPosition.trim()) payload.position = onboardPosition.trim();
      }

      const res = await adminApi.createStakeholder(payload);
      Alert.alert(res.success ? "Success" : "Error", res.message || "Account created successfully.");
      if (res.success) {
        setOnboardFullName("");
        setOnboardEmail("");
        setOnboardPhone("");
        setOnboardPassword("");
        setOnboardAgency("");
        setOnboardSpecialties("");
        setOnboardServiceAreas("");
        setOnboardDepartment("");
        setOnboardPosition("");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed provisioning Account.");
    } finally {
      setLoading(false);
    }
  };

  // Settings Controls Save
  const handleToggleSetting = async (field, val) => {
    const updated = { ...platformSettings, [field]: val };
    setPlatformSettings(updated);
    try {
      const res = await adminApi.updatePlatformSettings({ [field]: val });
      if (!res.success) {
        Alert.alert("Error", res.message || "Failed saving configurations.");
      }
    } catch (err) {
      console.warn("Failed saving platform settings:", err);
    }
  };

  const addAmenityTag = async () => {
    if (!newAmenity.trim()) return;
    const list = [...platformSettings.amenities, newAmenity.trim()];
    setPlatformSettings(prev => ({ ...prev, amenities: list }));
    setNewAmenity("");
    try {
      await adminApi.updatePlatformSettings({ amenities: list });
    } catch (err) {
      console.warn(err);
    }
  };

  const deleteAmenityTag = async (index) => {
    const list = platformSettings.amenities.filter((_, i) => i !== index);
    setPlatformSettings(prev => ({ ...prev, amenities: list }));
    try {
      await adminApi.updatePlatformSettings({ amenities: list });
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Control Panels Navigation Bar */}
      <View style={styles.panelBar}>
        {PANELS.map(p => {
          const isSelected = activePanel === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.panelBtn, isSelected && styles.panelBtnActive]}
              onPress={() => setActivePanel(p.id)}
            >
              <Ionicons name={p.icon} size={18} color={isSelected ? COLORS.primary : COLORS.mutedText} />
              <Text style={[styles.panelLabel, isSelected && styles.panelLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Render Panel Content */}
      <View style={{ flex: 1 }}>
        {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingIndicator} />}

        {/* users panel */}
        {activePanel === "users" && (
          <View style={styles.panelContainer}>
            {/* search and filter users bar */}
            <View style={styles.filterRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color={COLORS.mutedText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search user profile..."
                  placeholderTextColor={COLORS.mutedText}
                  value={userSearch}
                  onChangeText={setUserSearch}
                  onSubmitEditing={() => loadUsers(true)}
                />
              </View>
              {/* Role filter pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
                <TouchableOpacity
                  style={[styles.pill, userRoleFilter === "" && styles.pillActive]}
                  onPress={() => handleUserFilterChange("")}
                >
                  <Text style={[styles.pillText, userRoleFilter === "" && styles.pillTextActive]}>ALL ROLES</Text>
                </TouchableOpacity>
                {["client", "realtor", "staff", "stakeholder", "admin"].map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.pill, userRoleFilter === role && styles.pillActive]}
                    onPress={() => handleUserFilterChange(role)}
                  >
                    <Text style={[styles.pillText, userRoleFilter === role && styles.pillTextActive]}>
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Status filter pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.pillsRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 6 }]}>
                <TouchableOpacity
                  style={[styles.pill, userStatusFilter === "" && styles.pillActive]}
                  onPress={() => handleUserStatusFilterChange("")}
                >
                  <Text style={[styles.pillText, userStatusFilter === "" && styles.pillTextActive]}>ALL STATUSES</Text>
                </TouchableOpacity>
                {["active", "pending", "suspended"].map(status => {
                  let badgeText = status === "active" ? "#2E7D32" : status === "pending" ? "#1565C0" : "#C62828";
                  let isSel = userStatusFilter === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[styles.pill, isSel && { backgroundColor: badgeText }]}
                      onPress={() => handleUserStatusFilterChange(status)}
                    >
                      <Text style={[styles.pillText, { color: isSel ? "#fff" : badgeText, fontWeight: "700" }]}>
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <FlatList
              data={users}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => handleUserCardPress(item)}
                >
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: COLORS.softPrimary }]}>
                        <Text style={[styles.badgeText, { color: COLORS.primary }]}>{item.role.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: item.status === "active" ? "#E8F5E9" : item.status === "pending" ? "#E3F2FD" : "#FFEBEE" }]}>
                        <Text style={[styles.badgeText, { color: item.status === "active" ? "#2E7D32" : item.status === "pending" ? "#1565C0" : "#C62828" }]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.mutedText} />
                </TouchableOpacity>
              )}
              onEndReached={() => {
                if (userHasMore && !loading) loadUsers();
              }}
              onEndReachedThreshold={0.2}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people" size={32} color={COLORS.mutedText} />
                    <Text style={styles.emptyText}>No user profiles match selected filters.</Text>
                  </View>
                )
              }
            />
          </View>
        )}

        {/* properties panel */}
        {activePanel === "properties" && (
          <View style={styles.panelContainer}>
            <View style={styles.filterRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color={COLORS.mutedText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search listings..."
                  placeholderTextColor={COLORS.mutedText}
                  value={propSearch}
                  onChangeText={setPropSearch}
                  onSubmitEditing={() => loadProperties(true)}
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
                <TouchableOpacity
                  style={[styles.pill, propStatusFilter === "" && styles.pillActive]}
                  onPress={() => handlePropFilterChange("")}
                >
                  <Text style={[styles.pillText, propStatusFilter === "" && styles.pillTextActive]}>All</Text>
                </TouchableOpacity>
                {["draft", "pending", "active", "reserved", "sold", "archived", "rejected"].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.pill, propStatusFilter === status && styles.pillActive]}
                    onPress={() => handlePropFilterChange(status)}
                  >
                    <Text style={[styles.pillText, propStatusFilter === status && styles.pillTextActive]}>
                      {status.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={properties}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => {
                    setSelectedProp(item);
                    setPropModalVisible(true);
                  }}
                >
                  <View style={[styles.avatarPlaceholder, { backgroundColor: "#ECEFF1" }]}>
                    <Ionicons name="business" size={18} color={COLORS.mutedText} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.userEmail}>{item.city}, {item.state}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: item.status === "active" ? "#E8F5E9" : "#FFF3E0" }]}>
                        <Text style={[styles.badgeText, { color: item.status === "active" ? "#2E7D32" : "#EF6C00" }]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.propPrice}>NGN {item.price?.toLocaleString()}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.mutedText} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="business" size={32} color={COLORS.mutedText} />
                    <Text style={styles.emptyText}>No property listings found.</Text>
                  </View>
                )
              }
            />
          </View>
        )}

        {/* provisioning form panel */}
        {activePanel === "provision" && (
          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>Onboard Platform Member</Text>
            <Text style={styles.formSub}>Register secure, managed operational accounts natively.</Text>

            {/* Role segmented selector - STRICTLY NO ADMIN */}
            <Text style={styles.inputLabel}>Choose Account Business Role</Text>
            <View style={styles.roleSelectorBar}>
              {[
                { id: "stakeholder", label: "Stakeholder", icon: "briefcase-outline" },
                { id: "realtor", label: "Realtor", icon: "business-outline" },
                { id: "staff", label: "Staff Member", icon: "people-outline" }
              ].map(role => {
                const isSelected = onboardRole === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleSelectBtn, isSelected && styles.roleSelectBtnActive]}
                    onPress={() => setOnboardRole(role.id)}
                  >
                    <Ionicons name={role.icon} size={15} color={isSelected ? "#fff" : COLORS.mutedText} />
                    <Text style={[styles.roleSelectText, isSelected && styles.roleSelectTextActive]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Common Onboarding Fields */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Aliko Dangote"
              placeholderTextColor={COLORS.mutedText}
              value={onboardFullName}
              onChangeText={setOnboardFullName}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. dangote@linpal.com"
              placeholderTextColor={COLORS.mutedText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={onboardEmail}
              onChangeText={setOnboardEmail}
            />

            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. +234 803 123 4567"
              placeholderTextColor={COLORS.mutedText}
              keyboardType="phone-pad"
              value={onboardPhone}
              onChangeText={setOnboardPhone}
            />

            <Text style={styles.inputLabel}>Initial Access Password</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Must be at least 6 characters"
              placeholderTextColor={COLORS.mutedText}
              secureTextEntry
              value={onboardPassword}
              onChangeText={setOnboardPassword}
            />

            {/* Realtor Specific Conditional Fields */}
            {onboardRole === "realtor" && (
              <View style={styles.conditionalSection}>
                <Text style={styles.conditionalTitle}>Realtor Professional Dossier</Text>

                <Text style={styles.inputLabel}>Associated Brokerage / Agency</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Redfin Estates Nigeria"
                  placeholderTextColor={COLORS.mutedText}
                  value={onboardAgency}
                  onChangeText={setOnboardAgency}
                />

                <Text style={styles.inputLabel}>Specialties (comma-separated)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Luxury Penthouses, Commercial Sales, Rentals"
                  placeholderTextColor={COLORS.mutedText}
                  value={onboardSpecialties}
                  onChangeText={setOnboardSpecialties}
                />

                <Text style={styles.inputLabel}>Service Areas (comma-separated)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Lekki Phase 1, Ikoyi, Victoria Island"
                  placeholderTextColor={COLORS.mutedText}
                  value={onboardServiceAreas}
                  onChangeText={setOnboardServiceAreas}
                />
              </View>
            )}

            {/* Staff Specific Conditional Fields */}
            {onboardRole === "staff" && (
              <View style={styles.conditionalSection}>
                <Text style={styles.conditionalTitle}>Staff Department Assignment</Text>

                <Text style={styles.inputLabel}>Assigned Department</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Escrow Management, Legal, Support"
                  placeholderTextColor={COLORS.mutedText}
                  value={onboardDepartment}
                  onChangeText={setOnboardDepartment}
                />

                <Text style={styles.inputLabel}>Organizational Title / Position</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Senior Settlement Officer"
                  placeholderTextColor={COLORS.mutedText}
                  value={onboardPosition}
                  onChangeText={setOnboardPosition}
                />
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={triggerProvisionUser}>
              <Text style={styles.primaryBtnText}>Provision Access Profile</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* platform configuration settings panel */}
        {activePanel === "settings" && (
          <ScrollView contentContainerStyle={styles.settingsScroll}>
            <Text style={styles.formTitle}>Platform Controls</Text>
            <Text style={styles.formSub}>Manage global operational configurations instantly.</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Maintenance Mode</Text>
                <Text style={styles.toggleDesc}>Restrict customer client-side access during updates.</Text>
              </View>
              <Switch
                value={platformSettings.maintenanceMode}
                onValueChange={(val) => handleToggleSetting("maintenanceMode", val)}
                trackColor={{ false: "#ECEFF1", true: COLORS.primary }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Listings Approval Required</Text>
                <Text style={styles.toggleDesc}>Realtors submissions must pass manual Review queue.</Text>
              </View>
              <Switch
                value={platformSettings.listingsApprovalRequired}
                onValueChange={(val) => handleToggleSetting("listingsApprovalRequired", val)}
                trackColor={{ false: "#ECEFF1", true: COLORS.primary }}
              />
            </View>

            <Text style={styles.settingsTitle}>Permitted Amenities Whitelist</Text>
            <View style={styles.amenitiesContainer}>
              {platformSettings.amenities?.map((amenity, idx) => (
                <View key={idx} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                  <TouchableOpacity onPress={() => deleteAmenityTag(idx)}>
                    <Ionicons name="close-circle" size={14} color="#C62828" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.addAmenityRow}>
              <TextInput
                style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
                placeholder="Add new amenity..."
                placeholderTextColor={COLORS.mutedText}
                value={newAmenity}
                onChangeText={setNewAmenity}
              />
              <TouchableOpacity style={styles.addAmenityBtn} onPress={addAmenityTag}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* User Actions Modal */}
      {selectedUser && (
        <Modal visible={userModalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={[styles.modalBody, { maxHeight: "85%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Dossier: {selectedUser.fullName}</Text>
                <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {loadingUserDetail ? (
                  <View style={{ paddingVertical: 30, alignItems: "center" }}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, fontSize: 12, color: COLORS.mutedText }}>Retrieving user profile file...</Text>
                  </View>
                ) : (
                  selectedUserDetail && (
                    <View style={styles.detailContainer}>
                      {/* Dossier Header Card */}
                      <View style={styles.dossierRow}>
                        <View style={styles.dossierAvatar}>
                          <Text style={styles.dossierAvatarText}>
                            {selectedUserDetail.profile?.fullName?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dossierName}>{selectedUserDetail.profile?.fullName}</Text>
                          <Text style={styles.dossierSub}>{selectedUserDetail.profile?.email}</Text>
                          <View style={{ flexDirection: "row", marginTop: 4 }}>
                            <View style={[styles.badge, { backgroundColor: COLORS.softPrimary, marginRight: 6 }]}>
                              <Text style={[styles.badgeText, { color: COLORS.primary }]}>
                                {selectedUserDetail.profile?.role?.toUpperCase()}
                              </Text>
                            </View>
                            <View style={[
                              styles.badge, 
                              { backgroundColor: selectedUserDetail.profile?.status === "active" ? "#E8F5E9" : selectedUserDetail.profile?.status === "pending" ? "#E3F2FD" : "#FFEBEE" }
                            ]}>
                              <Text style={[
                                styles.badgeText, 
                                { color: selectedUserDetail.profile?.status === "active" ? "#2E7D32" : selectedUserDetail.profile?.status === "pending" ? "#1565C0" : "#C62828" }
                              ]}>
                                {selectedUserDetail.profile?.status?.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Contact and Activity Metrics */}
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockTitle}>Contact & Registration Files</Text>
                        <View style={styles.infoGridRow}>
                          <Text style={styles.infoGridLabel}>Phone Number:</Text>
                          <Text style={styles.infoGridValue}>{selectedUserDetail.profile?.phone || "Not provided"}</Text>
                        </View>
                        <View style={styles.infoGridRow}>
                          <Text style={styles.infoGridLabel}>Date Onboarded:</Text>
                          <Text style={styles.infoGridValue}>
                            {new Date(selectedUserDetail.profile?.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.infoGridRow}>
                          <Text style={styles.infoGridLabel}>Last Session Active:</Text>
                          <Text style={styles.infoGridValue}>
                            {selectedUserDetail.profile?.lastLoginAt 
                              ? new Date(selectedUserDetail.profile.lastLoginAt).toLocaleString() 
                              : "No recorded login history"}
                          </Text>
                        </View>
                      </View>

                      {/* Realtor Details */}
                      {selectedUserDetail.profile?.role === "realtor" && (
                        <View style={[styles.infoBlock, { borderColor: "#2E7D32", borderWidth: 1 }]}>
                          <Text style={[styles.infoBlockTitle, { color: "#2E7D32" }]}>Realtor Credentials & Scope</Text>
                          <View style={styles.infoGridRow}>
                            <Text style={styles.infoGridLabel}>Agency Name:</Text>
                            <Text style={styles.infoGridValue}>{selectedUserDetail.profile?.agency || "Independent Agency"}</Text>
                          </View>
                          <View style={styles.infoGridRow}>
                            <Text style={styles.infoGridLabel}>Specialties:</Text>
                            <Text style={styles.infoGridValue}>
                              {selectedUserDetail.profile?.specialties?.length 
                                ? selectedUserDetail.profile.specialties.join(", ") 
                                : "N/A"}
                            </Text>
                          </View>
                          <View style={styles.infoGridRow}>
                            <Text style={styles.infoGridLabel}>Service Areas:</Text>
                            <Text style={styles.infoGridValue}>
                              {selectedUserDetail.profile?.serviceAreas?.length 
                                ? selectedUserDetail.profile.serviceAreas.join(", ") 
                                : "N/A"}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Staff Details */}
                      {selectedUserDetail.profile?.role === "staff" && (
                        <View style={[styles.infoBlock, { borderColor: "#E65100", borderWidth: 1 }]}>
                          <Text style={[styles.infoBlockTitle, { color: "#E65100" }]}>Staff Credentials</Text>
                          <View style={styles.infoGridRow}>
                            <Text style={styles.infoGridLabel}>Department:</Text>
                            <Text style={styles.infoGridValue}>{selectedUserDetail.profile?.department || "N/A"}</Text>
                          </View>
                          <View style={styles.infoGridRow}>
                            <Text style={styles.infoGridLabel}>Position Title:</Text>
                            <Text style={styles.infoGridValue}>{selectedUserDetail.profile?.position || "N/A"}</Text>
                          </View>
                        </View>
                      )}

                      {/* Engagement statistics */}
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockTitle}>Platform Engagement Dossier</Text>
                        <View style={styles.infoGridRow}>
                          <Text style={styles.infoGridLabel}>Total Property Listings:</Text>
                          <Text style={[styles.infoGridValue, { fontWeight: "700" }]}>
                            {selectedUserDetail.propertiesCount || 0}
                          </Text>
                        </View>
                        <View style={styles.infoGridRow}>
                          <Text style={styles.infoGridLabel}>Total Scheduled Inspections:</Text>
                          <Text style={[styles.infoGridValue, { fontWeight: "700" }]}>
                            {selectedUserDetail.inspectionsCount || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                )}

                {/* Audit Context */}
                <Text style={styles.modalLabel}>Auditing Reason (Required for Logs)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter audited action explanation..."
                  placeholderTextColor={COLORS.mutedText}
                  value={userActionReason}
                  onChangeText={setUserActionReason}
                />

                <Text style={styles.modalSectionTitle}>Modify System Status</Text>
                <View style={styles.actionGrid}>
                  {selectedUser.status === "active" ? (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]} onPress={() => triggerUserStatus("suspended")}>
                      <Text style={[styles.actionBtnText, { color: "#C62828" }]}>Suspend Profile</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#E8F5E9" }]} onPress={() => triggerUserStatus("active")}>
                      <Text style={[styles.actionBtnText, { color: "#2E7D32" }]}>Activate & Restore</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ECEFF1" }]} onPress={() => triggerUserStatus("disabled")}>
                    <Text style={[styles.actionBtnText, { color: "#37474F" }]}>Disable Profile</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSectionTitle}>Account Role Migration</Text>
                <View style={styles.actionGrid}>
                  {["client", "realtor", "staff", "stakeholder"].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleActionBtn,
                        selectedUser.role === role && { borderColor: COLORS.primary, borderWidth: 1.5 }
                      ]}
                      onPress={() => triggerUserRole(role)}
                    >
                      <Text style={styles.roleActionText}>{role.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Property Actions Modal */}
      {selectedProp && (
        <Modal visible={propModalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalBody}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedProp.title}</Text>
                <TouchableOpacity onPress={() => setPropModalVisible(false)}>
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Action Description / Notes</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Audit logs description..."
                placeholderTextColor={COLORS.mutedText}
                value={propActionReason}
                onChangeText={setPropActionReason}
              />

              <Text style={styles.modalSectionTitle}>Listings Transitions</Text>
              <View style={styles.actionGrid}>
                {selectedProp.status !== "active" && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#E8F5E9" }]} onPress={() => triggerPropStatus("active")}>
                    <Text style={[styles.actionBtnText, { color: "#2E7D32" }]}>Approve & Publish</Text>
                  </TouchableOpacity>
                )}
                {selectedProp.status !== "rejected" && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FFF3E0" }]} onPress={() => triggerPropStatus("rejected")}>
                    <Text style={[styles.actionBtnText, { color: "#EF6C00" }]}>Reject Listing</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]} onPress={triggerPropDelete}>
                  <Text style={[styles.actionBtnText, { color: "#C62828" }]}>Archive (Delete)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  panelBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  panelBtn: {
    alignItems: "center",
    flex: 1
  },
  panelBtnActive: {
    opacity: 1
  },
  panelLabel: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 4,
    fontFamily: "Inter"
  },
  panelLabelActive: {
    color: COLORS.primary,
    fontWeight: "bold"
  },
  loadingIndicator: {
    marginVertical: 12
  },
  panelContainer: {
    flex: 1
  },
  filterRow: {
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 8
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter"
  },
  pillsRow: {
    flexDirection: "row"
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  pillText: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  pillTextActive: {
    color: "#fff"
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.cardBackground
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.softPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 2,
    fontFamily: "Inter"
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center"
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Inter"
  },
  propPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    fontFamily: "Inter"
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 8,
    fontFamily: "Inter"
  },
  formContainer: {
    padding: 20
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  formSub: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 4,
    marginBottom: 20,
    fontFamily: "Inter"
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    fontFamily: "Inter"
  },
  formInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    color: COLORS.text,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Inter"
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Inter"
  },
  settingsScroll: {
    padding: 20
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider
  },
  toggleText: {
    flex: 1,
    marginRight: 12
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  toggleDesc: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 2,
    fontFamily: "Inter"
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 12,
    fontFamily: "Inter"
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  amenityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  amenityText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    fontFamily: "Inter"
  },
  addAmenityRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  addAmenityBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12
  },
  modalBg: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalBody: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
    fontFamily: "Inter"
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    fontFamily: "Inter"
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    color: COLORS.text,
    marginBottom: 16,
    fontSize: 13,
    fontFamily: "Inter"
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 10,
    fontFamily: "Inter"
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  actionBtn: {
    width: "48%",
    height: 38,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter"
  },
  roleActionBtn: {
    width: "23%", // Make them slightly narrower since we have 4 roles now
    height: 34,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  roleActionText: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  // Onboarding Form Style Tokens
  roleSelectorBar: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16
  },
  roleSelectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4
  },
  roleSelectBtnActive: {
    backgroundColor: COLORS.primary
  },
  roleSelectText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  roleSelectTextActive: {
    color: "#fff"
  },
  conditionalSection: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    padding: 12,
    marginVertical: 12
  },
  conditionalTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Inter"
  },
  // Rich Dossier Drawer Style Tokens
  detailContainer: {
    marginBottom: 16
  },
  dossierRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 14,
    borderRadius: 10,
    marginBottom: 14
  },
  dossierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.softPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  dossierAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary
  },
  dossierName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    fontFamily: "Inter"
  },
  dossierSub: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 1,
    fontFamily: "Inter"
  },
  infoBlock: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  infoBlockTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.mutedText,
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    fontFamily: "Inter"
  },
  infoGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.03)"
  },
  infoGridLabel: {
    fontSize: 11,
    color: COLORS.mutedText,
    fontFamily: "Inter"
  },
  infoGridValue: {
    fontSize: 11,
    color: COLORS.text,
    fontFamily: "Inter",
    textAlign: "right",
    flex: 1,
    marginLeft: 12
  }
});
