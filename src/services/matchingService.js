export function matchDonors(request, donors) {
  if (!request || !donors) return [];

  const matched = donors.filter((donor) => {
    // شرط 1: available فقط
    const isAvailable = donor.available === true;

    // شرط 2: blood type match (أساسي)
    const bloodMatch = donor.bloodType === request.bloodType;

    // شرط 3 (اختياري): نفس المدينة
    const locationMatch =
      !request.location || !donor.location
        ? true
        : donor.location === request.location;

    return isAvailable && bloodMatch && locationMatch;
  });

  return matched;
}