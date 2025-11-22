"use client";

import Image from "next/image";

interface ProfileAvatarProps {
    src?: string;
    alt: string;
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function ProfileAvatar({
    src,
    alt,
    name,
    size = "md",
    className = "",
}: ProfileAvatarProps) {
    // Define size classes
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-32 h-32",
    };

    const iconSizeClasses = {
        sm: "text-xs",
        md: "text-base",
        lg: "text-4xl",
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const iconSize = iconSizeClasses[size] || iconSizeClasses.md;

    return (
        <div
            className={`${sizeClass} rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 overflow-hidden ${className}`}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={size === "lg" ? 128 : size === "md" ? 48 : 32}
                    height={size === "lg" ? 128 : size === "md" ? 48 : 32}
                    className="w-full h-full object-cover"
                    priority={size === "lg"}
                />
            ) : (
                <span className={`text-white font-bold ${iconSize}`}>
                    {name.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}
