import { shiftDate, shiftDay } from "@/lib/dates";
import type {
  Activity,
  AppState,
  CommitteeMeeting,
  DocumentRecord,
  Idea,
  ResearchEvent,
  ResearchQuestion,
  Thesis,
  ThesisSnapshot,
  Valuation,
} from "@/lib/types";

const NOT = "Not yet documented.";

function valuation(
  currentPrice: number,
  bearFairValue: number,
  baseFairValue: number,
  bullFairValue: number,
  targetEntry: number,
  minMarginOfSafety: number,
  updatedDaysAgo: number,
): Valuation {
  return {
    currentPrice,
    bearFairValue,
    baseFairValue,
    bullFairValue,
    targetEntry,
    minMarginOfSafety,
    updatedAt: shiftDate(-updatedDaysAgo, 16, 10),
  };
}

function thesis(
  input: Pick<
    Thesis,
    | "businessOverview"
    | "whyMispriced"
    | "status"
    | "lastSubstantiveReview"
    | "lastEditedAt"
    | "changeSummary"
  > &
    Partial<Thesis>,
): Thesis {
  return {
    competitiveAdvantages: NOT,
    growthDrivers: NOT,
    capitalAllocation: NOT,
    managementQuality: NOT,
    mainRisks: NOT,
    invalidators: NOT,
    bullCase: NOT,
    baseCase: NOT,
    bearCase: NOT,
    ...input,
  };
}

function question(
  input: ResearchQuestion,
): ResearchQuestion {
  return input;
}

function document(input: DocumentRecord): DocumentRecord {
  return { ...input, illustrative: true };
}

function snapshot(
  id: string,
  daysAgo: number,
  savedBy: string,
  summary: string,
  stored: Thesis,
): ThesisSnapshot {
  return {
    id,
    savedAt: shiftDate(-daysAgo, 15, 0),
    savedBy,
    summary,
    thesis: stored,
  };
}

export function createSeedState(): AppState {
  const seededAt = new Date().toISOString();

  const helderhavenThesis = thesis({
    status: "active",
    lastSubstantiveReview: shiftDay(-40),
    lastEditedAt: shiftDate(-6, 11, 20),
    changeSummary: "Refined the aftermarket gross-profit share to 47%. Base fair value unchanged.",
    businessOverview:
      "Helderhaven Industrials is a fictional Dutch maker of seals, couplings, and small pumps for process plants. Illustrative FY2025 revenue is €890 million, with an EBIT margin of 13.1%. The family holds 54% of the votes. Aftermarket parts are 47% of gross profit and are less cyclical than the OEM book.",
    whyMispriced:
      "The share price of €42.50 still discounts a German automotive downturn. Auto is 18% of revenue, not the centre of the business. The aftermarket mix is higher than the sell-side notes in this workspace assume.",
    competitiveAdvantages:
      "Specified parts stay in a plant for decades. Helderhaven’s drawings and service network make a second source expensive for the customer. Gross margin on aftermarket parts is about twice the OEM margin in the illustrative accounts.",
    growthDrivers:
      "Installed-base growth is modest, around 3% a year. The research case is mix and price, not a new end market. Process-industry maintenance budgets are the relevant driver.",
    capitalAllocation:
      "Net debt is 0.6× illustrative EBITDA. The stated policy is a 45% payout and bolt-on deals only inside seals and fluid handling. No large acquisition is in the current file.",
    managementQuality:
      "The fictional chief executive, Annelies de Waal, has been in the role since 2021. Returns on capital have stayed above 15% in the illustrative series. The family board has blocked two unrelated diversifications.",
    mainRisks:
      "A deeper European process-industry recession, a quality issue in the German plant, and a family transaction that prioritises control over price.",
    invalidators:
      "Aftermarket gross profit falling below 35% of the group for two years, or returns on capital below 10% without a temporary plant outage.",
    bullCase:
      "Aftermarket reaches 55% of gross profit and the auto book stabilises. Illustrative bull fair value €74.",
    baseCase:
      "Mix stays near 47% and the margin holds around 13%. Illustrative base fair value €61.",
    bearCase:
      "European maintenance spending falls and the margin compresses to 9%. Illustrative bear fair value €48. The balance sheet can carry that year.",
  });

  const vossfjordThesis = thesis({
    status: "active",
    lastSubstantiveReview: shiftDay(-4),
    lastEditedAt: shiftDate(-4, 17, 5),
    changeSummary: "Bear case now includes a yard-liability range. Base fair value unchanged at €168.",
    businessOverview:
      "Vossfjord Marine is a fictional Norwegian yard group servicing and refitting coastal and offshore vessels from Bergen and Florø. Illustrative FY2025 revenue is €640 million, EBIT margin 9.4%, net cash €85 million. The order book is €1.1 billion.",
    whyMispriced:
      "At €126 the shares are priced as a late-cycle newbuild yard. About 62% of the order book is service and retrofit work with a shorter cash cycle. The file still carries the memory of a cancelled ferry programme in 2024.",
    competitiveAdvantages:
      "Dry-dock capacity in western Norway is scarce. Three Nordic coastal operators have multi-year docking slots. Moving a vessel to another yard is operationally costly for those customers.",
    growthDrivers:
      "Fleet age and emissions-retrofit work can extend the service cycle through 2029. The case is mix, not a new country.",
    capitalAllocation:
      "The fictional policy is to stay net cash, pay out about 40% of net income, and avoid speculative newbuild. A special dividend of €1.20 was paid in 2025 in this dataset.",
    managementQuality:
      "Sigrid Moen, the fictional chief executive since 2019, has kept capital spending inside the dock-maintenance plan. Incentives are tied to return on capital, not revenue.",
    mainRisks:
      "A gap in the 2027 newbuild schedule, cost overrun on a hybrid ferry still in the yard, and an environmental liability at Bergen that is not fully quantified.",
    invalidators:
      "Service order intake below €300 million for two consecutive years, or a quantified Bergen liability above €70 million.",
    bullCase:
      "Service mix moves toward 70% of revenue and the hybrid ferry is delivered on the current budget. Illustrative bull fair value €205.",
    baseCase:
      "Service stays near 60% of the book, the EBIT margin holds near 9%, and the liability is €25 million. Illustrative base fair value €168.",
    bearCase:
      "Newbuild goes quiet in 2027 and the liability is €70 million. Illustrative bear fair value €118. Net cash keeps the yard solvent in that case.",
  });

  const aurelianThesis = thesis({
    status: "under_review",
    lastSubstantiveReview: shiftDay(-18),
    lastEditedAt: shiftDate(-2, 9, 40),
    changeSummary: "Flagged the Q3 volume miss against the −2% base-case assumption. Fair values not yet revised.",
    businessOverview:
      "Aurelian Glass is a fictional French container-glass group supplying wine, spirits, and food customers from furnaces in the Loire and Catalonia. Illustrative FY2025 revenue is €1.05 billion and EBIT margin is 11.2%.",
    whyMispriced:
      "The €54.20 price assumes furnace volumes stay structurally weak. The research file had treated the weakness as a one-year destock. The latest fictional trading update challenges that.",
    competitiveAdvantages:
      "Local furnaces next to bottling plants save freight, and colour-matched glass is specified by brand owners. Contracts often run three years.",
    growthDrivers:
      "Premium spirits volume and a slow return of European wine exports. Energy cost, not volume, was the original margin driver in the base case.",
    capitalAllocation:
      "A furnace rebuild in Catalonia is the only large project, capped at €80 million in the illustrative plan. Dividend cover is about 2×.",
    managementQuality:
      "The fictional finance director publishes furnace utilisation with the trading updates. Capital spending has matched the plan for four illustrative years.",
    mainRisks:
      "Volume loss to Iberian competitors, another energy spike before hedges roll off, and a customer shift from glass to cans in food.",
    invalidators:
      "Container-glass volumes down more than 4% for two consecutive years, or energy hedges covering less than half of the next year’s gas need.",
    bullCase:
      "Volumes recover to flat and the energy hedge holds. Illustrative bull fair value €88.",
    baseCase:
      "Volumes decline 2% and the margin stays near 11%. Illustrative base fair value €71. This assumption is now in question.",
    bearCase:
      "Volumes decline 6% and a furnace is idled. Illustrative bear fair value €46.",
  });

  const balticaPrior = thesis({
    status: "active",
    lastSubstantiveReview: shiftDay(-30),
    lastEditedAt: shiftDate(-30, 14, 0),
    changeSummary: "Base case used a 12-year remaining concession life.",
    businessOverview:
      "Baltica Ports is a fictional operator of landlord ports in Helsinki and Tallinn. Illustrative FY2025 revenue is €310 million, mostly port dues and warehouse rent. EBIT margin is 28%.",
    whyMispriced:
      "The shares at €19.70 price the concessions as if renewal were uncertain in the next planning cycle. Draft terms in this file are longer than that.",
    competitiveAdvantages:
      "The two harbours sit on the short-sea route between Finland and the Baltic states. Replicating the quays is not practical.",
    growthDrivers:
      "Warehouse rent and a modest rise in trailer traffic. Not a volume boom.",
    capitalAllocation:
      "Maintenance capex is about 8% of revenue. The fictional policy returns surplus cash once concession terms are signed.",
    managementQuality:
      "The fictional management has not added cruise terminals or unrelated property. That restraint is the quality point.",
    mainRisks:
      "A weaker Finnish export year, a political delay to the concession, and wage inflation on the docks.",
    invalidators:
      "Concession life reset below 10 years, or EBIT margin below 20% without a one-off dredging cost.",
    bullCase:
      "Both concessions are extended on the draft terms and rent escalates. Illustrative bull fair value €33.",
    baseCase:
      "Helsinki is extended and Tallinn is unchanged. Illustrative base fair value €27.50.",
    bearCase:
      "Renewal slips and traffic is flat. Illustrative bear fair value €17.",
  });

  const ideas: Idea[] = [
    {
      id: "helderhaven",
      companyName: "Helderhaven Industrials",
      ticker: "HLDH.AS",
      country: "Netherlands",
      sector: "Industrials",
      stage: "deep_research",
      leadAnalystId: "marcus",
      priority: "high",
      conviction: "medium",
      nextAction: "Reconcile the aftermarket mix with the FY2025 segment note.",
      researchReason:
        "A family-controlled components business whose aftermarket economics may be under-appreciated because of a visible auto exposure.",
      lastUpdated: shiftDate(-6, 11, 20),
      createdAt: shiftDate(-80, 10, 0),
      earningsComparison: {
        previousSummary:
          "First-half note: group revenue €448 million, auto down 9%, aftermarket orders up 4%. Assumption in the file: auto weakness stays isolated.",
        latestSummary:
          "Nine-month note: revenue €690 million, auto down 7%, aftermarket gross profit still 47% of the group. No change to the mix claim.",
        assumptionTouched: "Auto weakness stays isolated from the aftermarket margin",
        contradicts: false,
      },
      thesis: helderhavenThesis,
      thesisHistory: [
        snapshot(
          "snap-helderhaven-1",
          40,
          "marcus",
          "Initial deep-research draft. Aftermarket share was carried at 44% of gross profit.",
          {
            ...helderhavenThesis,
            changeSummary: "Initial deep-research draft.",
            lastEditedAt: shiftDate(-40, 15, 0),
            lastSubstantiveReview: shiftDay(-40),
          },
        ),
      ],
      valuation: valuation(42.5, 48, 61, 74, 46, 0.25, 6),
      questions: [
        question({
          id: "q-helderhaven-mix",
          question:
            "What share of revenue is true aftermarket rather than OEM, and how stable is pricing?",
          ownerId: "marcus",
          priority: "high",
          status: "in_progress",
          dueDate: shiftDay(-4),
          notes:
            "Segment note in the file shows 47% of gross profit. Revenue share is still not split cleanly.",
          createdAt: shiftDate(-20, 9, 0),
          updatedAt: shiftDate(-4, 9, 0),
        }),
        question({
          id: "q-helderhaven-family",
          question: "Can the family block a value-destructive acquisition?",
          ownerId: "ines",
          priority: "medium",
          status: "open",
          dueDate: shiftDay(12),
          notes: "Articles in the file give the family enhanced voting rights. Veto mechanics are not summarised.",
          createdAt: shiftDate(-12, 9, 0),
          updatedAt: shiftDate(-12, 9, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-helderhaven-note",
          title: "Illustrative FY2025 segment note — Helderhaven",
          type: "internal_note",
          publicationDate: shiftDay(-30),
          analystNotes:
            "Fictional internal note. Aftermarket 47% of gross profit; auto 18% of revenue.",
          associatedClaim: "Aftermarket economics dominate gross profit.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-30, 11, 0),
        }),
        document({
          id: "doc-helderhaven-earn",
          title: "Illustrative nine-month trading summary — Helderhaven",
          type: "earnings_summary",
          publicationDate: shiftDay(-6),
          sourceUrl: "https://example.com/illustrative/helderhaven-9m",
          analystNotes: "Fictional summary prepared for this demo. Not a company filing.",
          associatedClaim: "Auto weakness has not yet hit the aftermarket margin.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-6, 11, 30),
        }),
      ],
    },
    {
      id: "nordmark",
      companyName: "Nordmark Paper",
      ticker: "NMRK.ST",
      country: "Sweden",
      sector: "Materials",
      stage: "valuation",
      leadAnalystId: "ines",
      priority: "medium",
      conviction: "medium",
      nextAction: "Finish the pulp-spread sensitivity before the next review.",
      researchReason:
        "A specialty packaging-paper mill with captive pulp that may be earning a cycle-high spread the market is capitalising.",
      lastUpdated: shiftDate(-8, 16, 0),
      createdAt: shiftDate(-70, 10, 0),
      earningsComparison: {
        previousSummary:
          "FY2025 illustrative result: revenue €1.24 billion, pulp self-sufficiency 70%, EBIT margin 14%.",
        latestSummary:
          "Latest fictional quarter: margin 13.6%. The spread narrowed slightly and did not break the base case.",
        assumptionTouched: "Pulp self-sufficiency keeps the margin near 14%",
        contradicts: false,
      },
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-22),
        lastEditedAt: shiftDate(-8, 16, 0),
        changeSummary: "Added a pulp-spread sensitivity. Base fair value set at €112.",
        businessOverview:
          "Nordmark Paper is a fictional Swedish producer of greaseproof and sack paper, with a captive pulp line covering about 70% of fibre needs. Illustrative FY2025 revenue is €1.24 billion and the EBIT margin is 14%.",
        whyMispriced:
          "At €88 the shares capitalise the current spread. The open question is whether captive pulp is a structural advantage or a cycle peak.",
        competitiveAdvantages:
          "Food-contact certifications and a northern fibre basket. Customers do not switch grades quickly.",
        growthDrivers:
          "Substitution from plastic in food service, at low single-digit volume. Price, not tonnes, has driven the recent margin.",
        capitalAllocation:
          "Net debt is 1.1× illustrative EBITDA after a recovery boiler project. Further large projects are paused in the file.",
        managementQuality:
          "The fictional mill manager publishes downtime with the quarterly note. No unrelated diversification is proposed.",
        mainRisks:
          "Pulp prices falling while paper prices lag, a stronger krona, and a delayed payback on the boiler.",
        invalidators:
          "EBIT margin below 8% for a full year without a planned shutdown, or pulp self-sufficiency below 50%.",
        bullCase:
          "The spread normalises slowly and food-contact volume grows. Illustrative bull fair value €134.",
        baseCase:
          "Margin settles near 11% as the spread cools. Illustrative base fair value €112.",
        bearCase:
          "The spread collapses and the boiler earns its cost of capital late. Illustrative bear fair value €79.",
      }),
      thesisHistory: [],
      valuation: valuation(88, 79, 112, 134, 80, 0.22, 8),
      questions: [
        question({
          id: "q-nordmark-pulp",
          question: "Is the pulp cost advantage structural or a cycle peak?",
          ownerId: "ines",
          priority: "high",
          status: "open",
          dueDate: shiftDay(8),
          notes: "Sensitivity is drafted. Needs a through-cycle margin, not just FY2025.",
          createdAt: shiftDate(-15, 10, 0),
          updatedAt: shiftDate(-8, 16, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-nordmark-model",
          title: "Illustrative valuation workbook — Nordmark",
          type: "valuation_model",
          publicationDate: shiftDay(-8),
          analystNotes: "Fictional workbook. Base value €112. Pulp-spread tab is incomplete.",
          associatedClaim: "Base fair value depends on the spread cooling to an 11% margin.",
          illustrative: true,
          addedBy: "ines",
          addedAt: shiftDate(-8, 16, 10),
        }),
      ],
    },
    {
      id: "castelmare",
      companyName: "Castelmare Foods",
      ticker: "CSMF.MI",
      country: "Italy",
      sector: "Consumer Staples",
      stage: "watchlist",
      leadAnalystId: "elena",
      priority: "medium",
      conviction: "high",
      nextAction: "Review only if the price reaches the target entry or private label accelerates.",
      researchReason:
        "A family pantry brand with pricing power that is understood, but not yet at the price the fund requires.",
      lastUpdated: shiftDate(-24, 18, 0),
      createdAt: shiftDate(-120, 10, 0),
      waitKind: "price",
      waitReason:
        "The brand franchise is understood. The illustrative price is still above the target entry, so the fund is waiting for a better price rather than more basic research.",
      nextReviewTrigger:
        "Review if the illustrative price reaches €16.20, or if private-label share in the core olive-oil SKUs exceeds 28%.",
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-50),
        lastEditedAt: shiftDate(-50, 13, 0),
        changeSummary: "Thesis left intact at the September committee. Waiting on price.",
        businessOverview:
          "Castelmare Foods is a fictional Italian branded pantry company, centred on olive oil, tomatoes, and dry pasta. Illustrative FY2025 revenue is €540 million and the EBIT margin is 11%.",
        whyMispriced:
          "It is not obviously mispriced at €18.40. The franchise is good. The fund’s required margin of safety is simply not there yet.",
        competitiveAdvantages:
          "Brand recognition in Italian retail and a grower network that private label has not fully copied. Repeat purchase is the moat, not a patent.",
        growthDrivers:
          "Export of the olive-oil brand into Germany and a small price mix gain. Volume growth is low.",
        capitalAllocation:
          "Family payout is high, near 70% of illustrative net income, and leverage is low. That is acceptable while returns stay high.",
        managementQuality:
          "The third-generation fictional chair has not chased foodservice acquisitions. The limitation is a thin bench below the family.",
        mainRisks:
          "Private-label share in olive oil, a poor harvest passing through late, and key-person reliance on the family.",
        invalidators:
          "Private-label share above 28% in the core SKUs, or the EBIT margin below 8% for reasons other than a single harvest.",
        bullCase:
          "Export grows and private label stalls. Illustrative bull fair value €29.50.",
        baseCase:
          "The franchise holds and growth stays low single digit. Illustrative base fair value €24.",
        bearCase:
          "Private label takes the olive-oil shelf. Illustrative bear fair value €16.50.",
      }),
      thesisHistory: [],
      valuation: valuation(18.4, 16.5, 24, 29.5, 16.2, 0.28, 50),
      questions: [
        question({
          id: "q-castelmare-pl",
          question: "What is private-label penetration in the core olive-oil SKUs?",
          ownerId: "elena",
          priority: "medium",
          status: "open",
          dueDate: shiftDay(34),
          notes: "Last figure in the file is 21%. The trigger is 28%.",
          createdAt: shiftDate(-50, 13, 0),
          updatedAt: shiftDate(-50, 13, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-castelmare-note",
          title: "Illustrative brand note — Castelmare",
          type: "internal_note",
          publicationDate: shiftDay(-50),
          analystNotes: "Fictional note. Franchise understood; price is the constraint.",
          associatedClaim: "The thesis does not require more basic research before a price review.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-50, 13, 20),
        }),
      ],
    },
    {
      id: "brightholm",
      companyName: "Brightholm Logistics",
      ticker: "BRHL.L",
      country: "United Kingdom",
      sector: "Industrials",
      stage: "initial_screening",
      leadAnalystId: "ines",
      priority: "low",
      conviction: "unformed",
      nextAction: "Decide whether the UK e-commerce exposure is a cycle or a share gain.",
      researchReason:
        "A contract-logistics name that appeared in a screen of owner-operated UK industrials. Not yet a thesis.",
      lastUpdated: shiftDate(-11, 15, 0),
      createdAt: shiftDate(-18, 10, 0),
      thesis: thesis({
        status: "draft",
        lastSubstantiveReview: shiftDay(-11),
        lastEditedAt: shiftDate(-11, 15, 0),
        changeSummary: "Moved into initial screening. No fair-value conviction yet.",
        businessOverview:
          "Brightholm Logistics is a fictional UK contract warehouse and regional haulage group. Illustrative revenue is £210 million, shown in this workspace as €3.15 a share only for house-currency discussion.",
        whyMispriced:
          "Too early to claim a mispricing. The shares look inexpensive against a peak e-commerce year, which may be the wrong base.",
        mainRisks:
          "Contract churn, a thin margin, and customer concentration in two online retailers.",
        invalidators: "If the two largest customers are more than half of revenue, the screen fails.",
      }),
      thesisHistory: [],
      valuation: valuation(3.15, 2.4, 4.1, 5.2, 2.7, 0.3, 11),
      questions: [
        question({
          id: "q-brightholm-ecom",
          question: "Is the UK e-commerce exposure a cycle or a lasting share gain?",
          ownerId: "ines",
          priority: "low",
          status: "open",
          dueDate: shiftDay(15),
          notes: "Customer list is incomplete in the screening file.",
          createdAt: shiftDate(-11, 15, 0),
          updatedAt: shiftDate(-11, 15, 0),
        }),
      ],
      documents: [],
    },
    {
      id: "vossfjord",
      companyName: "Vossfjord Marine",
      ticker: "VSFM.OL",
      country: "Norway",
      sector: "Industrials",
      stage: "investment_committee",
      leadAnalystId: "marcus",
      priority: "high",
      conviction: "high",
      nextAction: "Add a valuation model before the committee sits. The dossier is otherwise ready.",
      researchReason:
        "A net-cash yard whose service book may be misread as late-cycle newbuild. Ready for committee, with one document still missing.",
      lastUpdated: shiftDate(-4, 17, 5),
      createdAt: shiftDate(-100, 10, 0),
      earningsComparison: {
        previousSummary:
          "FY2025 illustrative print: revenue €640 million, EBIT margin 9.4%, service 62% of the order book, net cash €85 million.",
        latestSummary:
          "Latest fictional monthly yard note: service intake still ahead of newbuild. The hybrid ferry is two weeks behind an internal schedule, inside the bear-case contingency.",
        assumptionTouched: "Service remains about 60% of the book and the ferry stays inside contingency",
        contradicts: false,
      },
      thesis: vossfjordThesis,
      thesisHistory: [
        snapshot(
          "snap-vossfjord-1",
          20,
          "marcus",
          "Base fair value €168 before the yard-liability range was written into the bear case.",
          {
            ...vossfjordThesis,
            bearCase:
              "Newbuild goes quiet in 2027. Illustrative bear fair value €130, with no quantified liability.",
            changeSummary: "Pre-liability draft.",
            lastEditedAt: shiftDate(-20, 11, 0),
          },
        ),
      ],
      valuation: valuation(126, 118, 168, 205, 108, 0.22, 4),
      questions: [
        question({
          id: "q-vossfjord-book",
          question: "What is a realistic order-book conversion for the 2027–29 service fleet?",
          ownerId: "marcus",
          priority: "high",
          status: "in_progress",
          dueDate: shiftDay(3),
          notes: "Working from the fictional order book. Conversion haircut is not agreed.",
          createdAt: shiftDate(-18, 10, 0),
          updatedAt: shiftDate(-4, 17, 0),
        }),
        question({
          id: "q-vossfjord-liability",
          question: "What is a quantified range for the environmental liability at the Bergen yard?",
          ownerId: "ines",
          priority: "high",
          status: "open",
          dueDate: shiftDay(2),
          notes: "Bear case uses €25–70 million. No primary schedule is in the file.",
          createdAt: shiftDate(-10, 10, 0),
          updatedAt: shiftDate(-4, 17, 10),
        }),
      ],
      documents: [
        document({
          id: "doc-vossfjord-ar",
          title: "Illustrative FY2025 annual accounts — Vossfjord Marine",
          type: "annual_report",
          publicationDate: shiftDay(-40),
          sourceUrl: "https://example.com/illustrative/vossfjord-fy2025",
          analystNotes:
            "Fictional accounts summary. Revenue €640 million, EBIT margin 9.4%, net cash €85 million.",
          associatedClaim: "The balance sheet is net cash.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-40, 12, 0),
        }),
        document({
          id: "doc-vossfjord-yard",
          title: "Illustrative yard monthly note — Vossfjord",
          type: "earnings_summary",
          publicationDate: shiftDay(-4),
          analystNotes: "Fictional note. Hybrid ferry two weeks behind an internal schedule.",
          associatedClaim: "The ferry delay is inside the bear-case contingency.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-4, 17, 20),
        }),
        document({
          id: "doc-vossfjord-ic",
          title: "Illustrative committee pre-read — Vossfjord",
          type: "internal_note",
          publicationDate: shiftDay(-3),
          analystNotes:
            "Fictional pre-read. States that a valuation model is not yet attached.",
          associatedClaim: "The committee pack is missing the valuation model.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-3, 9, 0),
        }),
      ],
    },
    {
      id: "aurelian",
      companyName: "Aurelian Glass",
      ticker: "AGLS.PA",
      country: "France",
      sector: "Materials",
      stage: "deep_research",
      leadAnalystId: "elena",
      priority: "high",
      conviction: "medium",
      nextAction: "Decide whether the Q3 volume miss is destocking or lost share.",
      researchReason:
        "A container-glass franchise that looked mispriced on energy hedges, until a fictional trading update cut across the volume assumption.",
      lastUpdated: shiftDate(-2, 9, 40),
      createdAt: shiftDate(-90, 10, 0),
      earningsComparison: {
        previousSummary:
          "First-half fictional summary: container volumes −1% versus the prior year. The base case carried −2% for the full year, treated as customer destocking.",
        latestSummary:
          "Q3 fictional trading update: container volumes −6%, with the miss concentrated in French wine bottles. Iberian competitors are named in the note as gaining two accounts.",
        assumptionTouched: "Full-year container volumes decline about 2%",
        contradicts: true,
      },
      thesis: aurelianThesis,
      thesisHistory: [
        snapshot(
          "snap-aurelian-1",
          18,
          "elena",
          "Base case assumed a −2% volume year caused by destocking, with fair values unchanged since.",
          {
            ...aurelianThesis,
            status: "active",
            changeSummary: "Deep-research draft before the Q3 update.",
            lastEditedAt: shiftDate(-18, 16, 0),
          },
        ),
      ],
      valuation: valuation(54.2, 46, 71, 88, 48, 0.25, 18),
      questions: [
        question({
          id: "q-aurelian-volume",
          question:
            "Does the Q3 volume miss reflect destocking or share loss to Iberian competitors?",
          ownerId: "elena",
          priority: "high",
          status: "open",
          dueDate: shiftDay(-2),
          notes: "The fictional update names two lost wine accounts. Destocking is no longer the default.",
          createdAt: shiftDate(-2, 9, 45),
          updatedAt: shiftDate(-2, 9, 45),
        }),
        question({
          id: "q-aurelian-hedge",
          question: "What share of 2027 gas need is already hedged?",
          ownerId: "ines",
          priority: "medium",
          status: "in_progress",
          dueDate: shiftDay(19),
          notes: "The file has a 2026 hedge schedule only.",
          createdAt: shiftDate(-16, 10, 0),
          updatedAt: shiftDate(-9, 10, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-aurelian-q3",
          title: "Illustrative Q3 trading update — Aurelian Glass",
          type: "earnings_summary",
          publicationDate: shiftDay(-2),
          sourceUrl: "https://example.com/illustrative/aurelian-q3",
          analystNotes:
            "Fictional update. Volumes −6%. Not a monitored filing and not externally verified.",
          associatedClaim: "Volumes are running worse than the −2% base-case assumption.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-2, 9, 50),
        }),
        document({
          id: "doc-aurelian-note",
          title: "Illustrative furnace and hedge note — Aurelian",
          type: "internal_note",
          publicationDate: shiftDay(-18),
          analystNotes: "Fictional note written before the Q3 update. Volume path is stale.",
          associatedClaim: "The earlier note assumed destocking, not share loss.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-18, 16, 30),
        }),
      ],
    },
    {
      id: "kiefernwald",
      companyName: "Kiefernwald Timber",
      ticker: "KFWT.DE",
      country: "Germany",
      sector: "Materials",
      stage: "discovered",
      leadAnalystId: "ines",
      priority: "low",
      conviction: "unformed",
      nextAction: "Read the illustrative timber-price note and decide if a screen is worth opening.",
      researchReason:
        "A sawmill and timber merchant that showed up when Central European timber prices fell. Discovery only.",
      lastUpdated: shiftDate(-8, 14, 0),
      createdAt: shiftDate(-8, 14, 0),
      thesis: thesis({
        status: "draft",
        lastSubstantiveReview: shiftDay(-8),
        lastEditedAt: shiftDate(-8, 14, 0),
        changeSummary: "Opened from the timber-price note. No thesis yet.",
        businessOverview:
          "Kiefernwald Timber is a fictional German sawmill and merchant. Illustrative revenue is €180 million. The discovery note does not yet separate commodity lumber from value-added products.",
        whyMispriced:
          "Unknown. The price of €22.10 may simply follow the timber cycle.",
        mainRisks: "A commodity price cycle and customer concentration in German housebuilders.",
      }),
      thesisHistory: [],
      valuation: valuation(22.1, 18, 27, 34, 19, 0.25, 8),
      questions: [
        question({
          id: "q-kiefernwald-mix",
          question: "How much of revenue is value-added timber rather than commodity lumber?",
          ownerId: "ines",
          priority: "low",
          status: "open",
          dueDate: shiftDay(20),
          notes: "No segment split in the discovery file.",
          createdAt: shiftDate(-8, 14, 10),
          updatedAt: shiftDate(-8, 14, 10),
        }),
      ],
      documents: [
        document({
          id: "doc-kiefernwald-ind",
          title: "Illustrative Central European timber note",
          type: "industry_note",
          publicationDate: shiftDay(-8),
          analystNotes: "Fictional industry note that prompted the discovery. Not a company document.",
          illustrative: true,
          addedBy: "ines",
          addedAt: shiftDate(-8, 14, 15),
        }),
      ],
    },
    {
      id: "polderlicht",
      companyName: "Polderlicht Utilities",
      ticker: "PDLU.AS",
      country: "Netherlands",
      sector: "Utilities",
      stage: "portfolio_candidate",
      leadAnalystId: "elena",
      priority: "high",
      conviction: "high",
      nextAction: "Watch the illustrative price against the €30 target entry.",
      researchReason:
        "A regulated Dutch network with a visible allowed-return review and a price now close to the fund’s entry.",
      lastUpdated: shiftDate(-24, 18, 30),
      createdAt: shiftDate(-160, 10, 0),
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-24),
        lastEditedAt: shiftDate(-24, 18, 30),
        changeSummary: "Committee approved the name as a portfolio candidate. Entry discipline unchanged.",
        businessOverview:
          "Polderlicht Utilities is a fictional regulated electricity network in the western Netherlands. Illustrative allowed revenue is €720 million and the equity return in the file is 5.4%.",
        whyMispriced:
          "At €30.60 the shares sit just above a €30 target entry. The mispricing, if any, is a slow allowed-return review rather than a hidden asset.",
        competitiveAdvantages:
          "A legal monopoly on the low-voltage network in its franchise. The advantage is the concession, not a brand.",
        growthDrivers:
          "Connection growth from electrification, earned only at the allowed return. Do not underwrite a volume story.",
        capitalAllocation:
          "Dividend is set to keep the regulatory gearing inside the band. Growth capex is funded inside that constraint in the model.",
        managementQuality:
          "The fictional regulator relationship has been uneventful. Management does not promote unregulated ventures.",
        mainRisks:
          "A lower allowed return at the next review, cost overruns on grid reinforcement, and political pressure on bills.",
        invalidators:
          "Allowed equity return reset below 4%, or reinforcement capex more than 20% above the plan without recovery.",
        bullCase:
          "The review is benign and the price reaches the entry. Illustrative bull fair value €43.",
        baseCase:
          "Return stays near 5.4% and capex is recovered on a lag. Illustrative base fair value €38.50.",
        bearCase:
          "The allowed return steps down and the lag hurts. Illustrative bear fair value €28.50.",
      }),
      thesisHistory: [],
      valuation: valuation(30.6, 28.5, 38.5, 43, 30, 0.18, 24),
      questions: [
        question({
          id: "q-polderlicht-return",
          question: "When does the Dutch regulator next review the allowed return?",
          ownerId: "elena",
          priority: "medium",
          status: "completed",
          dueDate: shiftDay(-20),
          notes: "Completed from the fictional regulatory calendar: review window opens in 14 months.",
          createdAt: shiftDate(-60, 10, 0),
          updatedAt: shiftDate(-24, 18, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-polderlicht-model",
          title: "Illustrative regulatory model — Polderlicht",
          type: "valuation_model",
          publicationDate: shiftDay(-24),
          analystNotes: "Fictional model. Base fair value €38.50. Target entry €30.",
          associatedClaim: "The price is close to the target entry.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-24, 18, 10),
        }),
      ],
    },
    {
      id: "sierra",
      companyName: "Sierra Alba Mining",
      ticker: "SALB.MC",
      country: "Spain",
      sector: "Materials",
      stage: "rejected",
      leadAnalystId: "marcus",
      priority: "low",
      conviction: "low",
      nextAction: "None. The idea is closed.",
      researchReason:
        "A polymetallic project that failed the holding-period and permitting screen.",
      lastUpdated: shiftDate(-24, 18, 40),
      createdAt: shiftDate(-140, 10, 0),
      rejectionReason:
        "Reserve life and permitting risk are incompatible with a ten-year holding period. Jurisdiction and capex intensity failed the screen.",
      thesis: thesis({
        status: "invalidated",
        lastSubstantiveReview: shiftDay(-30),
        lastEditedAt: shiftDate(-24, 18, 40),
        changeSummary: "Rejected at committee. Permitting and reserve life failed the screen.",
        businessOverview:
          "Sierra Alba Mining is a fictional Spanish polymetallic developer. The illustrative mine plan has an eight-year reserve life and a large upfront capex bill.",
        whyMispriced:
          "The file never established a mispricing. The €9.40 price is above the illustrative base value of €8.50.",
        mainRisks:
          "Permitting delay, a short reserve life, and capex that the balance sheet cannot fund without new equity.",
        invalidators:
          "Already failed: the holding period required by the fund is longer than the reserve life in the plan.",
        baseCase: "Illustrative base fair value €8.50, below the price. Not a candidate.",
        bearCase: "Permitting slips and equity is issued. Illustrative bear fair value €6.",
        bullCase: "A permit arrives on the current plan. Illustrative bull fair value €14. Still a poor fit for the holding period.",
      }),
      thesisHistory: [],
      valuation: valuation(9.4, 6, 8.5, 14, 7, 0.35, 24),
      questions: [],
      documents: [
        document({
          id: "doc-sierra-note",
          title: "Illustrative rejection note — Sierra Alba",
          type: "internal_note",
          publicationDate: shiftDay(-24),
          analystNotes: "Fictional note recording why the screen failed.",
          associatedClaim: "Reserve life is shorter than the fund’s holding period.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-24, 18, 45),
        }),
      ],
    },
    {
      id: "dunwich",
      companyName: "Dunwich Retail",
      ticker: "DNWR.L",
      country: "United Kingdom",
      sector: "Consumer Discretionary",
      stage: "watchlist",
      leadAnalystId: "marcus",
      priority: "low",
      conviction: "low",
      nextAction: "Do not add work unless lease-adjusted returns stabilise.",
      researchReason:
        "Kept on the watchlist to see whether a turnaround appears. The original quality thesis has deteriorated.",
      lastUpdated: shiftDate(-20, 11, 0),
      createdAt: shiftDate(-200, 10, 0),
      waitKind: "thesis",
      waitReason:
        "Thesis deteriorated: like-for-like sales and lease-adjusted returns no longer support the original quality bar. It stays on the watchlist to see if turnaround evidence appears, not because it is cheap.",
      nextReviewTrigger:
        "Reopen only if lease-adjusted returns hold above 8% for two reported periods.",
      thesis: thesis({
        status: "stale",
        lastSubstantiveReview: shiftDay(-150),
        lastEditedAt: shiftDate(-20, 11, 0),
        changeSummary: "Comment recorded that the quality bar is no longer met. No full rewrite since the spring review.",
        businessOverview:
          "Dunwich Retail is a fictional UK variety retailer. Illustrative revenue is €420 million. A store-closure programme is underway and lease-adjusted returns have fallen.",
        whyMispriced:
          "It is not a mispricing case. The €7.80 price is close to a lowered base value of €8.20, and the thesis that justified the work has weakened.",
        competitiveAdvantages:
          "A convenient store network. That advantage is weaker after the closures and is no longer the original case.",
        growthDrivers: "None that the file is willing to underwrite.",
        capitalAllocation:
          "Cash has gone to closing costs. The dividend was passed in the latest illustrative year.",
        managementQuality:
          "The fictional turnaround plan has slipped twice. That is the management issue.",
        mainRisks:
          "Further lease impairments, like-for-like declines, and a covenant discussion if closures cost more than planned.",
        invalidators:
          "Already impaired: lease-adjusted returns are below the 8% bar the original note required.",
        bullCase: "Closures finish and returns recover. Illustrative bull fair value €11. Not the working case.",
        baseCase: "Returns stay depressed. Illustrative base fair value €8.20.",
        bearCase: "A covenant amendment is required. Illustrative bear fair value €5.50.",
      }),
      thesisHistory: [],
      valuation: valuation(7.8, 5.5, 8.2, 11, 6.2, 0.3, 150),
      questions: [
        question({
          id: "q-dunwich-returns",
          question: "Have lease-adjusted returns stabilised after the store closures?",
          ownerId: "marcus",
          priority: "medium",
          status: "open",
          dueDate: shiftDay(-40),
          notes: "Overdue. Last figure in the file is below 8%. No one has refreshed it.",
          createdAt: shiftDate(-150, 10, 0),
          updatedAt: shiftDate(-40, 10, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-dunwich-note",
          title: "Illustrative spring thesis note — Dunwich",
          type: "internal_note",
          publicationDate: shiftDay(-150),
          analystNotes: "Fictional note. This is the last substantive review and it is stale.",
          associatedClaim: "The original quality bar required lease-adjusted returns above 8%.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-150, 15, 0),
        }),
      ],
    },
    {
      id: "ostmark",
      companyName: "Ostmark Components",
      ticker: "OSMC.DE",
      country: "Germany",
      sector: "Industrials",
      stage: "valuation",
      leadAnalystId: "marcus",
      priority: "high",
      conviction: "medium",
      nextAction: "Unblock the customer-concentration question before relying on the base value.",
      researchReason:
        "A precision-components supplier that looks inexpensive if customer concentration is acceptable. The file is blocked on that fact.",
      lastUpdated: shiftDate(-7, 10, 0),
      createdAt: shiftDate(-110, 10, 0),
      thesis: thesis({
        status: "stale",
        lastSubstantiveReview: shiftDay(-140),
        lastEditedAt: shiftDate(-140, 12, 0),
        changeSummary: "Valuation draft started, but the thesis itself has not been reviewed since the spring.",
        businessOverview:
          "Ostmark Components is a fictional German maker of precision metal parts for industrial equipment. Illustrative FY2025 revenue is €480 million and the EBIT margin is 12%.",
        whyMispriced:
          "At €67 against a base value of €86 the gap is real only if no single customer can impair the plants. That fact is missing.",
        competitiveAdvantages:
          "Tooling that sits inside customer platforms for a model cycle. Switching costs are high once tooled, and low before that.",
        growthDrivers:
          "Content per machine, not a new geography. The cycle follows European equipment orders.",
        capitalAllocation:
          "Moderate leverage, 1.3× illustrative EBITDA. Buybacks are not part of the policy in the file.",
        managementQuality:
          "Disclosure of customer concentration has been poor in the fictional accounts. That is a mark against management until the fact book arrives.",
        mainRisks:
          "Customer concentration, a downturn in equipment orders, and a tooling write-off if a platform is cancelled.",
        invalidators:
          "Any customer above 25% of revenue, or a platform cancellation that cuts EBIT by more than 15%.",
        bullCase:
          "Concentration is modest and the cycle turns. Illustrative bull fair value €104.",
        baseCase:
          "Top five customers are material but no one is above 20%. Illustrative base fair value €86. This is an assumption, not a finding.",
        bearCase:
          "One customer is above 30% and a platform slips. Illustrative bear fair value €58.",
      }),
      thesisHistory: [],
      valuation: valuation(67, 58, 86, 104, 62, 0.22, 140),
      questions: [
        question({
          id: "q-ostmark-customer",
          question: "What is top-five customer concentration, and how long are the contracts?",
          ownerId: "marcus",
          priority: "high",
          status: "blocked",
          dueDate: shiftDay(-7),
          notes: "Blocked. The fictional company fact book was requested and has not been logged.",
          createdAt: shiftDate(-30, 10, 0),
          updatedAt: shiftDate(-7, 10, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-ostmark-model",
          title: "Illustrative draft model — Ostmark",
          type: "valuation_model",
          publicationDate: shiftDay(-14),
          analystNotes: "Fictional draft. Base value €86 is conditional on concentration.",
          associatedClaim: "The valuation should not be used until concentration is known.",
          illustrative: true,
          addedBy: "marcus",
          addedAt: shiftDate(-14, 11, 0),
        }),
      ],
    },
    {
      id: "lumenara",
      companyName: "Lumenara Diagnostics",
      ticker: "LMND.PA",
      country: "France",
      sector: "Health Care",
      stage: "initial_screening",
      leadAnalystId: "ines",
      priority: "medium",
      conviction: "unformed",
      nextAction: "Clear the reimbursement question or drop the screen.",
      researchReason:
        "A diagnostics lab group that may be a quality compounder, if French and German reimbursement is stable. The screen is incomplete.",
      lastUpdated: shiftDate(-6, 9, 0),
      createdAt: shiftDate(-25, 10, 0),
      thesis: thesis({
        status: "draft",
        lastSubstantiveReview: shiftDay(-15),
        lastEditedAt: shiftDate(-15, 11, 0),
        changeSummary: "Screen opened. Reimbursement is the gating question.",
        businessOverview:
          "Lumenara Diagnostics is a fictional French laboratory group. Illustrative revenue is €260 million, mostly routine assays. One higher-margin assay is still seeking broader reimbursement.",
        whyMispriced:
          "Not established. The €45.20 price is only interesting if the core assay is reimbursed in both France and Germany.",
        mainRisks:
          "Reimbursement cuts, lab-staff inflation, and a single assay carrying the growth story.",
        invalidators:
          "If the core assay is not reimbursed in France, the screen should stop.",
        baseCase: "Illustrative base fair value €58, contingent on reimbursement. Not a concluded value.",
        bearCase: "Reimbursement fails. Illustrative bear fair value €32.",
        bullCase: "Both countries reimburse the assay. Illustrative bull fair value €76.",
      }),
      thesisHistory: [],
      valuation: valuation(45.2, 32, 58, 76, 36, 0.3, 15),
      questions: [
        question({
          id: "q-lumenara-reimburse",
          question: "What is the reimbursement status in France and Germany for the core assay?",
          ownerId: "ines",
          priority: "high",
          status: "open",
          dueDate: shiftDay(-6),
          notes: "Overdue. France is described as ‘pending’ in the screening memo. Germany is blank.",
          createdAt: shiftDate(-15, 11, 0),
          updatedAt: shiftDate(-6, 9, 0),
        }),
      ],
      documents: [],
    },
    {
      id: "baltica",
      companyName: "Baltica Ports",
      ticker: "BLTP.HE",
      country: "Finland",
      sector: "Industrials",
      stage: "deep_research",
      leadAnalystId: "elena",
      priority: "medium",
      conviction: "medium",
      nextAction: "Compare the Helsinki draft terms with the Tallinn concession side by side.",
      researchReason:
        "A landlord-port franchise where the concession length, not traffic growth, is the investment question.",
      lastUpdated: shiftDate(-3, 16, 30),
      createdAt: shiftDate(-75, 10, 0),
      thesis: thesis({
        ...balticaPrior,
        lastSubstantiveReview: shiftDay(-3),
        lastEditedAt: shiftDate(-3, 16, 30),
        changeSummary:
          "Raised the Helsinki concession duration in the base case after the draft terms.",
        baseCase:
          "Helsinki draft terms extend the concession and Tallinn is unchanged. Illustrative base fair value €27.50.",
      }),
      thesisHistory: [
        snapshot(
          "snap-baltica-1",
          30,
          "elena",
          "Base case used a 12-year remaining concession life.",
          balticaPrior,
        ),
      ],
      valuation: valuation(19.7, 17, 27.5, 33, 18, 0.25, 3),
      questions: [
        question({
          id: "q-baltica-concession",
          question: "What are the concession renewal terms at Helsinki and Tallinn?",
          ownerId: "elena",
          priority: "medium",
          status: "in_progress",
          dueDate: shiftDay(21),
          notes: "Helsinki draft is in the file. Tallinn is not.",
          createdAt: shiftDate(-20, 10, 0),
          updatedAt: shiftDate(-3, 16, 30),
        }),
      ],
      documents: [
        document({
          id: "doc-baltica-draft",
          title: "Illustrative Helsinki concession draft summary",
          type: "internal_note",
          publicationDate: shiftDay(-3),
          analystNotes: "Fictional summary of draft terms. Not an official concession document.",
          associatedClaim: "Helsinki draft terms are longer than the prior base case assumed.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-3, 16, 40),
        }),
      ],
    },
    {
      id: "rhineland",
      companyName: "Rhineland Chemicals",
      ticker: "RHCH.DE",
      country: "Germany",
      sector: "Materials",
      stage: "invested",
      leadAnalystId: "elena",
      priority: "high",
      conviction: "high",
      nextAction: "Keep the research file current. This record is not a position blotter.",
      researchReason:
        "The research process concluded that the specialty-chemicals franchise met the fund’s bar. Longview does not track shares, cost, or performance.",
      lastUpdated: shiftDate(-60, 15, 0),
      createdAt: shiftDate(-300, 10, 0),
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-60),
        lastEditedAt: shiftDate(-60, 15, 0),
        changeSummary: "Research outcome marked invested. No portfolio holdings are stored.",
        businessOverview:
          "Rhineland Chemicals is a fictional German specialty-chemicals producer focused on additives for coatings. Illustrative revenue is €980 million and the EBIT margin is 16%.",
        whyMispriced:
          "The work concluded the franchise was under-earning in the price at the time of the decision. This workspace does not show what was paid.",
        competitiveAdvantages:
          "Formulations specified into coatings plants, with qualification cycles of several years.",
        growthDrivers: "Content in water-borne coatings. Low volume growth, high retention.",
        capitalAllocation:
          "The fictional policy keeps leverage below 1.5× and returns cash above that. It has been followed in the illustrative years.",
        managementQuality:
          "The fictional chief executive has declined two large commodity acquisitions. That record is why the file was willing to conclude.",
        mainRisks: "A coatings recession, feedstock volatility, and a succession that is not yet named.",
        invalidators:
          "A commodity acquisition, or returns on capital below 12% for reasons other than feedstock.",
        bullCase: "Water-borne mix rises. Illustrative bull fair value €158.",
        baseCase: "Retention holds and growth stays modest. Illustrative base fair value €136.",
        bearCase: "A coatings downturn lasts two years. Illustrative bear fair value €98.",
      }),
      thesisHistory: [],
      valuation: valuation(112, 98, 136, 158, 105, 0.18, 60),
      questions: [],
      documents: [
        document({
          id: "doc-rhineland-note",
          title: "Illustrative decision note — Rhineland",
          type: "internal_note",
          publicationDate: shiftDay(-80),
          analystNotes:
            "Fictional note. Records a research outcome only. No share count or cost is stored.",
          associatedClaim: "The research process concluded. This is not a holding record.",
          illustrative: true,
          addedBy: "elena",
          addedAt: shiftDate(-80, 15, 0),
        }),
      ],
    },
    {
      id: "cairngorm",
      companyName: "Cairngorm Distillers",
      ticker: "CRGD.L",
      country: "United Kingdom",
      sector: "Consumer Staples",
      stage: "watchlist",
      leadAnalystId: "ines",
      priority: "medium",
      conviction: "medium",
      nextAction: "Wait for the fictional family statement on payout policy.",
      researchReason:
        "A whisky franchise the team understands. The open issue is capital returns, not the brand.",
      lastUpdated: shiftDate(-30, 12, 0),
      createdAt: shiftDate(-95, 10, 0),
      waitKind: "catalyst",
      waitReason:
        "The franchise is understood. The fund is waiting for the family holding company to clarify its capital-return policy. This is a catalyst wait, not a broken thesis.",
      nextReviewTrigger:
        "The family statement on dividend and any special distribution, or an illustrative price at or below €24.50.",
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-30),
        lastEditedAt: shiftDate(-30, 12, 0),
        changeSummary: "Moved to the watchlist pending the family capital-return statement.",
        businessOverview:
          "Cairngorm Distillers is a fictional Scotch whisky company with a malt brand and a bulk-blending business. Illustrative revenue is €390 million. Mature stock is the important asset.",
        whyMispriced:
          "At €28.40 the brand looks reasonable against a €36 base value, but the family has not said how cash will be returned. The gap is not actionable yet.",
        competitiveAdvantages:
          "Aged stock that a new entrant cannot replicate quickly, and a brand with repeat export demand in the file.",
        growthDrivers:
          "Export mix and price. Volume is intentionally constrained by stock.",
        capitalAllocation:
          "This is the unresolved point. The family holding company has not published a payout range. Cash has accumulated in the illustrative accounts.",
        managementQuality:
          "Operating management is conservative. Governance depends on the family, which is why the catalyst matters.",
        mainRisks:
          "A fashion swing away from the malt brand, excise duty, and cash trapped at the holding company.",
        invalidators:
          "A payout policy that hoards cash with no stated reason, or brand volumes down more than 10% for two years.",
        bullCase:
          "A stated payout range and a special distribution. Illustrative bull fair value €43.",
        baseCase:
          "Ordinary dividend continues and stock value is recognised slowly. Illustrative base fair value €36.",
        bearCase:
          "Cash stays trapped and US export demand cools. Illustrative bear fair value €24.",
      }),
      thesisHistory: [],
      valuation: valuation(28.4, 24, 36, 43, 24.5, 0.25, 30),
      questions: [
        question({
          id: "q-cairngorm-payout",
          question: "Will the family commit to a stated payout range?",
          ownerId: "ines",
          priority: "medium",
          status: "open",
          dueDate: shiftDay(49),
          notes: "Tied to the review trigger. No statement is in the file.",
          createdAt: shiftDate(-30, 12, 0),
          updatedAt: shiftDate(-30, 12, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-cairngorm-note",
          title: "Illustrative stock and payout note — Cairngorm",
          type: "internal_note",
          publicationDate: shiftDay(-30),
          analystNotes: "Fictional note. Brand work is done; payout is not.",
          associatedClaim: "The wait is for a capital-return statement, not for more brand research.",
          illustrative: true,
          addedBy: "ines",
          addedAt: shiftDate(-30, 12, 20),
        }),
      ],
    },
    {
      id: "adriatic",
      companyName: "Adriatic Packaging",
      ticker: "ADPK.VI",
      country: "Austria",
      sector: "Materials",
      stage: "discovered",
      leadAnalystId: "marcus",
      priority: "medium",
      conviction: "unformed",
      nextAction: "Write a one-page screen: folding carton versus commodity board.",
      researchReason:
        "An Austrian packaging converter found through a customer of Ostmark. Discovery stage, no thesis.",
      lastUpdated: shiftDate(-1, 16, 0),
      createdAt: shiftDate(-1, 16, 0),
      thesis: thesis({
        status: "draft",
        lastSubstantiveReview: shiftDay(-1),
        lastEditedAt: shiftDate(-1, 16, 0),
        changeSummary: "Opened from a competitor-supplier screen.",
        businessOverview:
          "Adriatic Packaging is a fictional Austrian folding-carton converter. Illustrative revenue is €210 million. The discovery note does not yet separate pharmaceutical cartons from food cartons.",
        whyMispriced: "Not claimed. The €15.60 price is only a starting point.",
        mainRisks: "Paper prices, customer concentration, and a thin public-information file.",
      }),
      thesisHistory: [],
      valuation: valuation(15.6, 13, 19.5, 24, 14, 0.25, 1),
      questions: [],
      documents: [],
    },
    {
      id: "marenfeld",
      companyName: "Marenfeld Bearings",
      ticker: "MRFB.DE",
      country: "Germany",
      sector: "Industrials",
      stage: "investment_committee",
      leadAnalystId: "ines",
      priority: "medium",
      conviction: "medium",
      nextAction: "Confirm how many auto platforms are sole-source before the second committee.",
      researchReason:
        "A bearings franchise with high returns, going to committee with the model attached and one open commercial question.",
      lastUpdated: shiftDate(-9, 13, 0),
      createdAt: shiftDate(-60, 10, 0),
      thesis: thesis({
        status: "active",
        lastSubstantiveReview: shiftDay(-9),
        lastEditedAt: shiftDate(-9, 13, 0),
        changeSummary: "Flagged sole-source uncertainty on two OEM platforms.",
        businessOverview:
          "Marenfeld Bearings is a fictional German manufacturer of industrial and auto bearings. Illustrative revenue is €760 million and the EBIT margin is 15%. Aftermarket is 30% of gross profit in the file.",
        whyMispriced:
          "At €51 against a €66 base value, the gap depends on whether two auto platforms are sole-source. If they are dual-source, the base value is too high.",
        competitiveAdvantages:
          "Specification into platforms and an aftermarket catalogue. The auto book is the weaker moat.",
        growthDrivers:
          "Industrial aftermarket and a small content gain. Auto units are not the case.",
        capitalAllocation:
          "Net cash. The fictional policy is a steady dividend and no empire-building.",
        managementQuality:
          "Disclosure is better than Ostmark’s. The open point is commercial, not accounting.",
        mainRisks:
          "Loss of a sole-source platform, auto cyclicality, and steel costs passing through late.",
        invalidators:
          "Loss of either flagged platform, or aftermarket gross profit below 20% of the group.",
        bullCase:
          "Both platforms are sole-source through the next cycle. Illustrative bull fair value €78.",
        baseCase:
          "One platform is sole-source. Illustrative base fair value €66.",
        bearCase:
          "Both are dual-source and auto volumes fall. Illustrative bear fair value €44.",
      }),
      thesisHistory: [],
      valuation: valuation(51, 44, 66, 78, 46, 0.22, 9),
      questions: [
        question({
          id: "q-marenfeld-sole",
          question: "How many of the auto OEM platforms are sole-source?",
          ownerId: "ines",
          priority: "high",
          status: "open",
          dueDate: shiftDay(10),
          notes: "Two platforms are flagged. The model’s base case assumes one is sole-source.",
          createdAt: shiftDate(-9, 13, 0),
          updatedAt: shiftDate(-9, 13, 0),
        }),
      ],
      documents: [
        document({
          id: "doc-marenfeld-model",
          title: "Illustrative valuation model — Marenfeld",
          type: "valuation_model",
          publicationDate: shiftDay(-9),
          analystNotes: "Fictional model attached for committee. Base fair value €66.",
          associatedClaim: "Base value assumes one of two flagged platforms is sole-source.",
          illustrative: true,
          addedBy: "ines",
          addedAt: shiftDate(-9, 13, 20),
        }),
        document({
          id: "doc-marenfeld-note",
          title: "Illustrative platform note — Marenfeld",
          type: "internal_note",
          publicationDate: shiftDay(-9),
          analystNotes: "Fictional note listing the two uncertain platforms.",
          associatedClaim: "Sole-source status is not confirmed.",
          illustrative: true,
          addedBy: "ines",
          addedAt: shiftDate(-9, 13, 30),
        }),
      ],
    },
  ];

  const meetings: CommitteeMeeting[] = [
    {
      id: "ic-upcoming-1",
      title: "Investment Committee",
      scheduledAt: shiftDate(4, 9, 0),
      status: "scheduled",
      location: "Amsterdam office, Room 3",
      notes:
        "Sample session. Vossfjord Marine is the dossier prepared for discussion. The valuation model is intentionally absent.",
      agenda: [
        {
          id: "agenda-vossfjord",
          companyId: "vossfjord",
          presenterId: "marcus",
        },
      ],
    },
    {
      id: "ic-upcoming-2",
      title: "Investment Committee",
      scheduledAt: shiftDate(18, 9, 0),
      status: "scheduled",
      location: "Amsterdam office, Room 3",
      notes: "Marenfeld Bearings is on the agenda. The illustrative model is attached in the company file.",
      agenda: [
        {
          id: "agenda-marenfeld",
          companyId: "marenfeld",
          presenterId: "ines",
        },
      ],
    },
    {
      id: "ic-september",
      title: "Investment Committee — September session",
      scheduledAt: shiftDate(-24, 9, 0),
      status: "completed",
      location: "Amsterdam office, Room 3",
      notes: "Historical session used to show recorded decisions.",
      agenda: [
        {
          id: "agenda-polderlicht",
          companyId: "polderlicht",
          presenterId: "elena",
          decision: {
            type: "approve_candidate",
            rationale:
              "The regulated franchise meets the quality bar. Approve as a portfolio candidate and keep the €30 illustrative entry. This is a research decision, not an instruction to trade.",
            decidedBy: "elena",
            decidedAt: shiftDate(-24, 11, 30),
          },
        },
        {
          id: "agenda-sierra",
          companyId: "sierra",
          presenterId: "marcus",
          decision: {
            type: "reject",
            rationale:
              "Reserve life and permitting risk are incompatible with a ten-year holding period. Do not continue the work.",
            decidedBy: "elena",
            decidedAt: shiftDate(-24, 12, 0),
          },
        },
        {
          id: "agenda-castelmare",
          companyId: "castelmare",
          presenterId: "elena",
          decision: {
            type: "add_watchlist",
            rationale:
              "The franchise is understood. Add to the watchlist and wait for the illustrative price to reach €16.20. No further basic research is required unless private label accelerates.",
            decidedBy: "elena",
            decidedAt: shiftDate(-24, 12, 20),
          },
        },
      ],
    },
  ];

  const events: ResearchEvent[] = [
    {
      id: "ev-nordmark-earn",
      companyId: "nordmark",
      kind: "earnings",
      title: "Nordmark Paper — illustrative earnings",
      date: shiftDay(10),
      detail: "Fictional earnings date for the demo calendar. Not a live company event.",
    },
    {
      id: "ev-helderhaven-earn",
      companyId: "helderhaven",
      kind: "earnings",
      title: "Helderhaven — illustrative earnings",
      date: shiftDay(16),
      detail: "Fictional earnings date.",
    },
    {
      id: "ev-aurelian-earn",
      companyId: "aurelian",
      kind: "earnings",
      title: "Aurelian Glass — illustrative earnings",
      date: shiftDay(23),
      detail: "Fictional earnings date, after the Q3 update already in the file.",
    },
    {
      id: "ev-ostmark-earn",
      companyId: "ostmark",
      kind: "earnings",
      title: "Ostmark Components — illustrative earnings",
      date: shiftDay(31),
      detail: "Fictional earnings date.",
    },
    {
      id: "ev-baltica-ar",
      companyId: "baltica",
      kind: "annual_report",
      title: "Baltica Ports — illustrative annual report",
      date: shiftDay(18),
      detail: "Fictional publication date.",
    },
    {
      id: "ev-cairngorm-ar",
      companyId: "cairngorm",
      kind: "annual_report",
      title: "Cairngorm Distillers — illustrative annual report",
      date: shiftDay(39),
      detail: "Fictional publication date. The payout statement may accompany it.",
    },
    {
      id: "ev-castelmare-review",
      companyId: "castelmare",
      kind: "thesis_review",
      title: "Castelmare — scheduled price review",
      date: shiftDay(25),
      detail: "Review the watch trigger even if the price has not hit €16.20.",
    },
    {
      id: "ev-dunwich-review",
      companyId: "dunwich",
      kind: "thesis_review",
      title: "Dunwich — overdue thesis review",
      date: shiftDay(-10),
      detail: "The substantive review is already stale. This calendar item is overdue.",
    },
    {
      id: "ev-vossfjord-review",
      companyId: "vossfjord",
      kind: "thesis_review",
      title: "Vossfjord — pre-committee thesis check",
      date: shiftDay(4),
      detail: "Same morning as the committee session.",
    },
  ];

  const activities: Activity[] = [
    {
      id: "act-adriatic",
      companyId: "adriatic",
      kind: "created",
      at: shiftDate(-1, 16, 0),
      actorId: "marcus",
      description: "Opened Adriatic Packaging from a competitor-supplier screen.",
    },
    {
      id: "act-aurelian",
      companyId: "aurelian",
      kind: "comment",
      at: shiftDate(-2, 9, 40),
      actorId: "elena",
      description: "Q3 fictional trading update contradicts the −2% volume assumption.",
    },
    {
      id: "act-baltica",
      companyId: "baltica",
      kind: "thesis_edit",
      at: shiftDate(-3, 16, 30),
      actorId: "elena",
      description: "Raised the Helsinki concession duration in the base case after the draft terms.",
    },
    {
      id: "act-vossfjord-val",
      companyId: "vossfjord",
      kind: "valuation_change",
      at: shiftDate(-4, 17, 5),
      actorId: "marcus",
      description: "Bear case now includes a yard-liability range. Base fair value unchanged at €168.",
    },
    {
      id: "act-helderhaven",
      companyId: "helderhaven",
      kind: "thesis_edit",
      at: shiftDate(-6, 11, 20),
      actorId: "marcus",
      description: "Refined the aftermarket gross-profit share to 47%. Base fair value unchanged.",
    },
    {
      id: "act-lumenara",
      companyId: "lumenara",
      kind: "question_update",
      at: shiftDate(-6, 9, 0),
      actorId: "ines",
      description: "Reimbursement question is still open and is now past its due date.",
    },
    {
      id: "act-ostmark",
      companyId: "ostmark",
      kind: "question_update",
      at: shiftDate(-7, 10, 0),
      actorId: "marcus",
      description: "Customer-concentration question marked blocked pending the fact book.",
    },
    {
      id: "act-nordmark",
      companyId: "nordmark",
      kind: "valuation_change",
      at: shiftDate(-8, 16, 0),
      actorId: "ines",
      description: "Added a pulp-spread sensitivity. Base fair value set at €112.",
    },
    {
      id: "act-kiefernwald",
      companyId: "kiefernwald",
      kind: "created",
      at: shiftDate(-8, 14, 0),
      actorId: "ines",
      description: "Opened Kiefernwald Timber after the Central European timber note.",
    },
    {
      id: "act-marenfeld",
      companyId: "marenfeld",
      kind: "thesis_edit",
      at: shiftDate(-9, 13, 0),
      actorId: "ines",
      description: "Flagged sole-source uncertainty on two OEM platforms.",
    },
    {
      id: "act-brightholm",
      companyId: "brightholm",
      kind: "stage_change",
      at: shiftDate(-11, 15, 0),
      actorId: "ines",
      description: "Moved Brightholm Logistics from Discovered to Initial Screening.",
    },
    {
      id: "act-vossfjord-stage",
      companyId: "vossfjord",
      kind: "stage_change",
      at: shiftDate(-12, 10, 0),
      actorId: "marcus",
      description: "Advanced Vossfjord Marine to Investment Committee.",
    },
    {
      id: "act-dunwich",
      companyId: "dunwich",
      kind: "comment",
      at: shiftDate(-20, 11, 0),
      actorId: "marcus",
      description: "Like-for-like sales and lease-adjusted returns no longer support the original quality bar.",
    },
    {
      id: "act-polderlicht",
      companyId: "polderlicht",
      meetingId: "ic-september",
      kind: "committee_decision",
      at: shiftDate(-24, 11, 30),
      actorId: "elena",
      description: "Committee approved Polderlicht Utilities as a portfolio candidate.",
    },
    {
      id: "act-sierra",
      companyId: "sierra",
      meetingId: "ic-september",
      kind: "committee_decision",
      at: shiftDate(-24, 12, 0),
      actorId: "elena",
      description: "Committee rejected Sierra Alba Mining.",
    },
    {
      id: "act-castelmare",
      companyId: "castelmare",
      meetingId: "ic-september",
      kind: "committee_decision",
      at: shiftDate(-24, 12, 20),
      actorId: "elena",
      description: "Committee added Castelmare Foods to the watchlist to wait for price.",
    },
    {
      id: "act-cairngorm",
      companyId: "cairngorm",
      kind: "watchlist",
      at: shiftDate(-30, 12, 0),
      actorId: "ines",
      description: "Waiting on the family capital-return statement.",
    },
    {
      id: "act-rhineland",
      companyId: "rhineland",
      kind: "stage_change",
      at: shiftDate(-80, 15, 0),
      actorId: "elena",
      description: "Research outcome recorded as invested. No position, cost, or performance is stored.",
    },
  ];

  return {
    version: 1,
    ideas,
    meetings,
    events,
    activities,
    team: [
      {
        id: "elena",
        name: "Elena Voss",
        role: "Portfolio Manager",
        initials: "EV",
        email: "elena.voss@longview.example",
      },
      {
        id: "marcus",
        name: "Marcus Hale",
        role: "Investment Analyst",
        initials: "MH",
        email: "marcus.hale@longview.example",
      },
      {
        id: "ines",
        name: "Inès Moreau",
        role: "Research Associate",
        initials: "IM",
        email: "ines.moreau@longview.example",
      },
    ],
    settings: {
      workspaceName: "Longview Capital — Demo",
      currency: "EUR",
      defaultPipelineView: "table",
      actingUserId: "elena",
    },
    seededAt,
  };
}
