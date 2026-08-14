import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { getAuthDestination } from "../utils/authRoutes";
export default function ProtectedGroup({ role, children }) { const { firebaseUser, profile, loading, authResolution } = useAuth(); if (loading) return <LoadingSpinner label="Checking access..." />; if (!firebaseUser) return <Redirect href="/login" />; const destination = getAuthDestination({ firebaseUser, profile, authResolution }); if (authResolution !== "ready") return <Redirect href={destination} />; if (!profile?.role || profile.role !== role) return <Redirect href={destination} />; return children; }
