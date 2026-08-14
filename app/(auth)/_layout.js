import { Redirect, Stack, usePathname } from "expo-router";
import FullScreenLoader from "../../components/FullScreenLoader";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthDestination } from "../../utils/authRoutes";
export default function AuthLayout() { const { firebaseUser, profile, loading, authResolution } = useAuth(); const pathname = usePathname(); if (loading) return <FullScreenLoader message="Checking your session..." />; if (firebaseUser) { const destination = getAuthDestination({ firebaseUser, profile, authResolution }); if (pathname !== destination) return <Redirect href={destination} />; } return <Stack screenOptions={{ headerShown: false }} />; }
