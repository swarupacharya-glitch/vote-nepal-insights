import { useMemo } from "react";
import { Candidate, AggregatedStats, FilterState, AGE_GROUPS } from "@/types/election";

// Compute aggregated statistics from candidates
export function useAggregatedStats(candidates: Candidate[]): AggregatedStats {
  return useMemo(() => {
    const stats: AggregatedStats = {
      totalCandidates: candidates.length,
      byParty: {},
      byProvince: {},
      byDistrict: {},
      byGender: {},
      byQualification: {},
      byAgeGroup: {},
    };

    // Initialize age groups
    AGE_GROUPS.forEach(group => {
      stats.byAgeGroup[group.label] = 0;
    });

    candidates.forEach(candidate => {
      // By Party
      stats.byParty[candidate.PoliticalPartyName] = 
        (stats.byParty[candidate.PoliticalPartyName] || 0) + 1;

      // By Province
      stats.byProvince[candidate.StateName] = 
        (stats.byProvince[candidate.StateName] || 0) + 1;

      // By District
      stats.byDistrict[candidate.DistrictName] = 
        (stats.byDistrict[candidate.DistrictName] || 0) + 1;

      // By Gender
      stats.byGender[candidate.Gender] = 
        (stats.byGender[candidate.Gender] || 0) + 1;

      // By Qualification
      stats.byQualification[candidate.QUALIFICATION] = 
        (stats.byQualification[candidate.QUALIFICATION] || 0) + 1;

      // By Age Group
      const ageGroup = AGE_GROUPS.find(
        g => candidate.AGE_YR >= g.min && candidate.AGE_YR <= g.max
      );
      if (ageGroup) {
        stats.byAgeGroup[ageGroup.label]++;
      }
    });

    return stats;
  }, [candidates]);
}

// Filter candidates based on filter state
export function useFilteredCandidates(
  candidates: Candidate[],
  filters: FilterState
): Candidate[] {
  return useMemo(() => {
    return candidates.filter(candidate => {
      if (filters.province && candidate.StateName !== filters.province) {
        return false;
      }
      if (filters.district && candidate.DistrictName !== filters.district) {
        return false;
      }
      if (filters.party && candidate.PoliticalPartyName !== filters.party) {
        return false;
      }
      if (filters.qualification && candidate.QUALIFICATION !== filters.qualification) {
        return false;
      }
      if (filters.gender && candidate.Gender !== filters.gender) {
        return false;
      }
      if (filters.ageMin && candidate.AGE_YR < filters.ageMin) {
        return false;
      }
      if (filters.ageMax && candidate.AGE_YR > filters.ageMax) {
        return false;
      }
      return true;
    });
  }, [candidates, filters]);
}

// Get unique values for filter options
export function useFilterOptions(candidates: Candidate[]) {
  return useMemo(() => {
    const provinces = [...new Set(candidates.map(c => c.StateName))].sort();
    const districts = [...new Set(candidates.map(c => c.DistrictName))].sort();
    const parties = [...new Set(candidates.map(c => c.PoliticalPartyName))].sort();
    const qualifications = [...new Set(candidates.map(c => c.QUALIFICATION))];
    const genders = [...new Set(candidates.map(c => c.Gender))];

    return { provinces, districts, parties, qualifications, genders };
  }, [candidates]);
}

// Convert record to chart data
export function recordToChartData(
  record: Record<string, number>,
  limit?: number
): { name: string; value: number }[] {
  const entries = Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  return limit ? entries.slice(0, limit) : entries;
}

// Short party name for display
export function getShortPartyName(fullName: string): string {
  const shortNames: Record<string, string> = {
    "नेपाली काँग्रेस": "काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
    "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
    "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
    "जनता समाजवादी पार्टी, नेपाल": "जसपा",
    "स्वतन्त्र": "स्वतन्त्र",
  };
  return shortNames[fullName] || fullName.slice(0, 15);
}
