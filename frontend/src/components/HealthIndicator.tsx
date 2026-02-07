"use client"

interface HealthIndicatorProps {
    ratio: number ;  // in bps, es. 15000 = 150%
}

export function HealthIndicator({ ratio }: HealthIndicatorProps){
    const percentage = ratio / 100;

    let color = "bg-green-500";
    let status = "Healthy";

    if (percentage < 130) {
        color = "bg-red-500";
        status = "Danger";
    } else if (percentage < 150){
        color = "bg-yellow-500";
        status = "Warning";
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-sm font-medium">
                {status} ({percentage.toFixed(0)}%)
            </span>
        </div>
    )
}