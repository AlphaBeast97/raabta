export const APP_NAME = "Raabta👋️";

const AppLogo = ({ className = "", size = 32, alt = APP_NAME }) => {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
};

export default AppLogo;
