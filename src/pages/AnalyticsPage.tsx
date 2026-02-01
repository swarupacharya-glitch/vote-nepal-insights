import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { allCandidates } from "@/data/mockCandidates";
import { useAggregatedStats } from "@/hooks/useElectionData";
import { getShortPartyName } from "@/hooks/useElectionData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(215, 55%, 35%)",
  "hsl(350, 55%, 50%)",
  "hsl(160, 50%, 45%)",
  "hsl(35, 70%, 55%)",
  "hsl(270, 40%, 55%)",
  "hsl(190, 55%, 45%)",
  "hsl(25, 65%, 50%)",
  "hsl(300, 35%, 50%)",
];

const AnalyticsPage = () => {
  const stats = useAggregatedStats(allCandidates);

  // Party qualification breakdown
  const partyQualificationData = useMemo(() => {
    const partyData: Record<string, Record<string, number>> = {};
    
    allCandidates.forEach((c) => {
      const shortParty = getShortPartyName(c.PoliticalPartyName);
      if (!partyData[shortParty]) {
        partyData[shortParty] = {};
      }
      partyData[shortParty][c.QUALIFICATION] = 
        (partyData[shortParty][c.QUALIFICATION] || 0) + 1;
    });

    // Get top 5 parties
    const topParties = Object.entries(stats.byParty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => getShortPartyName(name));

    const qualifications = ["स्नातक", "स्नातकोत्तर", "उच्च माध्यमिक", "माध्यमिक", "विद्यावारिधि"];

    return topParties.map((party) => ({
      name: party,
      ...qualifications.reduce((acc, qual) => ({
        ...acc,
        [qual]: partyData[party]?.[qual] || 0,
      }), {}),
    }));
  }, [stats.byParty]);

  // Gender by party
  const genderByPartyData = useMemo(() => {
    const partyGender: Record<string, { male: number; female: number }> = {};
    
    allCandidates.forEach((c) => {
      const shortParty = getShortPartyName(c.PoliticalPartyName);
      if (!partyGender[shortParty]) {
        partyGender[shortParty] = { male: 0, female: 0 };
      }
      if (c.Gender === "पुरुष") {
        partyGender[shortParty].male++;
      } else if (c.Gender === "महिला") {
        partyGender[shortParty].female++;
      }
    });

    return Object.entries(partyGender)
      .map(([name, data]) => ({
        name,
        पुरुष: data.male,
        महिला: data.female,
        femalePercent: ((data.female / (data.male + data.female)) * 100).toFixed(1),
      }))
      .sort((a, b) => (b.पुरुष + b.महिला) - (a.पुरुष + a.महिला))
      .slice(0, 7);
  }, []);

  // Age group data
  const ageGroupData = useMemo(() => {
    return Object.entries(stats.byAgeGroup).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats.byAgeGroup]);

  // Top universities
  const topUniversities = useMemo(() => {
    const unis: Record<string, number> = {};
    allCandidates.forEach((c) => {
      if (c.NAMEOFINST) {
        unis[c.NAMEOFINST] = (unis[c.NAMEOFINST] || 0) + 1;
      }
    });
    return Object.entries(unis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, []);

  // Province insights
  const provinceInsights = useMemo(() => {
    const provinceAge: Record<string, { total: number; sum: number }> = {};
    
    allCandidates.forEach((c) => {
      if (!provinceAge[c.StateName]) {
        provinceAge[c.StateName] = { total: 0, sum: 0 };
      }
      provinceAge[c.StateName].total++;
      provinceAge[c.StateName].sum += c.AGE_YR;
    });

    return Object.entries(provinceAge)
      .map(([name, data]) => ({
        name: name.replace(" प्रदेश", ""),
        avgAge: Math.round(data.sum / data.total),
        count: data.total,
      }))
      .sort((a, b) => a.avgAge - b.avgAge);
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-nepali">
          विस्तृत विश्लेषण
        </h1>
        <p className="mt-1 text-muted-foreground">
          Detailed Analytics & Insights
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Gender by Party */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">पार्टी अनुसार लिङ्ग</h3>
            <p className="text-xs text-muted-foreground">Gender distribution by political party</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genderByPartyData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="पुरुष" stackId="a" fill="hsl(215, 55%, 45%)" />
                <Bar dataKey="महिला" stackId="a" fill="hsl(350, 55%, 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            महिला उम्मेदवारहरूको प्रतिनिधित्व विभिन्न पार्टीहरूमा फरक छ।
          </p>
        </div>

        {/* Age Distribution */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">उमेर समूह वितरण</h3>
            <p className="text-xs text-muted-foreground">Age group distribution of candidates</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ageGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} उम्मेदवार`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            ३६-४५ वर्षको उमेर समूहमा सबैभन्दा बढी उम्मेदवारहरू छन्।
          </p>
        </div>

        {/* Province Average Age */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">प्रदेश अनुसार औसत उमेर</h3>
            <p className="text-xs text-muted-foreground">Average candidate age by province</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provinceInsights}
                margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis
                  domain={[35, 55]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: 'औसत उमेर', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} वर्ष (${props.payload.count} उम्मेदवार)`,
                    "औसत उमेर"
                  ]}
                />
                <Bar dataKey="avgAge" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {provinceInsights.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgAge < 44 ? "hsl(160, 50%, 45%)" : "hsl(var(--primary))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            हरियो बारहरूले औसतभन्दा कम उमेरका उम्मेदवारहरू भएका प्रदेश देखाउँछ।
          </p>
        </div>

        {/* Top Universities */}
        <div className="chart-container">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">शीर्ष शैक्षिक संस्थाहरू</h3>
            <p className="text-xs text-muted-foreground">Top institutions producing candidates</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topUniversities}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} उम्मेदवार`, ""]}
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            त्रिभुवन विश्वविद्यालय (TU) बाट सबैभन्दा धेरै उम्मेदवार आएका छन्।
          </p>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">मुख्य निष्कर्षहरू (Key Insights)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">महिला प्रतिनिधित्व</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {((stats.byGender["महिला"] || 0) / stats.totalCandidates * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Female representation</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">औसत उमेर</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {Math.round(allCandidates.reduce((a, c) => a + c.AGE_YR, 0) / allCandidates.length)} वर्ष
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average candidate age</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
