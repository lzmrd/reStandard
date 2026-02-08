"use client"

interface HealthIndicatorProps {
    ratio: number ;  // in bps, es. 15000 = 150%
}

export function HealthIndicator({ ratio }: HealthIndicatorProps){
    const percentage = ratio / 100;

    let dotColor = "bg-green-500";
    let glowColor = "shadow-[0_0_12px_rgba(16,185,129,0.6)]";
    let textColor = "text-green-400";
    let status = "Healthy";

    if (percentage < 130) {
        dotColor = "bg-red-500";
        glowColor = "shadow-[0_0_12px_rgba(239,68,68,0.6)]";
        textColor = "text-red-400";
        status = "Danger";
    } else if (percentage < 150){
        dotColor = "bg-yellow-500";
        glowColor = "shadow-[0_0_12px_rgba(234,179,8,0.6)]";
        textColor = "text-yellow-400";
        status = "Warning";
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${dotColor} ${glowColor} animate-pulse`} />
            <span className={`text-sm font-medium ${textColor}`}>
                {status} ({percentage.toFixed(0)}%)
            </span>
        </div>
    )
}
