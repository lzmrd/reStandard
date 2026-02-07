"use client";

import { useProperty } from "@/hooks/useContracts";

interface PropertyCardProps {
  propertyId: bigint;
  onOpenVault?: (propertyId: bigint) => void;
}

export function PropertyCard({ propertyId, onOpenVault }: PropertyCardProps) {
  const { data: property, isLoading } = useProperty(propertyId);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Property #{propertyId.toString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {property.comune}, {property.provincia}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            property.verified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {property.verified ? "Verified" : "Pending"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Foglio</p>
          <p className="font-medium">{property.foglio}</p>
        </div>
        <div>
          <p className="text-gray-500">Particella</p>
          <p className="font-medium">{property.particella}</p>
        </div>
        <div>
          <p className="text-gray-500">Subalterno</p>
          <p className="font-medium">{property.subalterno}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-500 text-sm">Categoria</p>
        <p className="font-medium">{property.categoria}</p>
      </div>

      {property.verified && onOpenVault && (
        <button
          onClick={() => onOpenVault(propertyId)}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open Vault
        </button>
      )}
    </div>
  );
}
