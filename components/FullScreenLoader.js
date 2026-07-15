import LoadingSpinner from "./LoadingSpinner";

export default function FullScreenLoader({ message = "Loading..." }) {
  return <LoadingSpinner label={message} />;
}
