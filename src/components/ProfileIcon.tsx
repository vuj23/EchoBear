const profileIcon = "https://www.figma.com/api/mcp/asset/f0e11906-3ea1-436f-a867-8387585d8861";

interface IconProps {
  size?: number;
  alt?: string;
}

export default function ProfileIcon({ size = 40, alt = "Profile" }: IconProps) {
  return (
    <img
      src={profileIcon}
      alt={alt}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}
