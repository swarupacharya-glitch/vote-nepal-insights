import { Candidate } from "@/types/election";
import { getShortPartyName } from "@/hooks/useElectionData";
import { User, MapPin, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  className?: string;
}

const partyColorMap: Record<string, string> = {
  "नेपाली काँग्रेस": "bg-blue-100 text-blue-800 border-blue-200",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "bg-red-100 text-red-800 border-red-200",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "bg-rose-100 text-rose-800 border-rose-200",
  "राष्ट्रिय स्वतन्त्र पार्टी": "bg-amber-100 text-amber-800 border-amber-200",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "bg-purple-100 text-purple-800 border-purple-200",
  "जनता समाजवादी पार्टी, नेपाल": "bg-green-100 text-green-800 border-green-200",
  "स्वतन्त्र": "bg-gray-100 text-gray-800 border-gray-200",
};

export function CandidateCard({ candidate, onClick, className }: CandidateCardProps) {
  const shortParty = getShortPartyName(candidate.PoliticalPartyName);
  const partyColor = partyColorMap[candidate.PoliticalPartyName] || "bg-secondary text-secondary-foreground";

  return (
    <div
      className={cn("candidate-card", className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-name text-foreground truncate font-nepali">
            {candidate.CandidateName}
          </h3>

          {/* Party Badge */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "badge-party border",
                partyColor
              )}
            >
              {shortParty}
            </span>
            <span className="text-xs text-muted-foreground">
              {candidate.SymbolName}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{candidate.DistrictName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{candidate.AGE_YR} वर्ष</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>{candidate.QUALIFICATION}</span>
        </div>
      </div>
    </div>
  );
}
