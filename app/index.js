import { Redirect } from "expo-router";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuth } from "../contexts/AuthContext";
import { getAuthDestination } from "../utils/authRoutes";
export default function Index() { const { firebaseUser, profile, loading, authResolution } = useAuth(); if (loading) return <FullScreenLoader message="Preparing your account..." />; return <Redirect href={getAuthDestination({ firebaseUser, profile, authResolution })} />; }
