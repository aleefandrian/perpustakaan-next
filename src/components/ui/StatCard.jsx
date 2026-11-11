import React from "react";
import Card from "@/components/ui/Card";

export default function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  className = "",
  iconBg = "bg-[#F5F0FF]",
  iconColor = "text-[#6D28D9]",
}) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#858095] uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-[#27233A] mt-1.5">{value}</h3>
          {description && (
            <p className="text-xs text-[#858095] mt-1">{description}</p>
          )}
          {trend && (
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-xs`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
