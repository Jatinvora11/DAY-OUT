/**
 * Build the structured Gemini prompt from trip parameters.
 */
const buildItineraryPrompt = ({
  location,
  startDate,
  endDate,
  adults,
  children,
  budget,
  budgetType,
  travelPace,
  accommodationType,
  tripStyles,
  mustSee,
  specialRequests,
  tripType,
}) => {
  const budgetLabel = budgetType === 'per_person' ? 'per person' : 'overall';
  const totalDays = Math.max(
    1,
    Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1,
  );

  const paceDescriptions = {
    relaxed: 'a relaxed pace with generous rest time between activities (3–4 activities per day)',
    moderate: 'a moderate pace balancing sightseeing with leisure (4–5 activities per day)',
    packed: 'a packed schedule maximising every hour (6–7 activities per day)',
  };
  const paceDetail = paceDescriptions[travelPace] || paceDescriptions.moderate;

  const stylesText =
    Array.isArray(tripStyles) && tripStyles.length > 0
      ? tripStyles.join(' and ')
      : tripType || 'general leisure';

  const mustSeeText =
    Array.isArray(mustSee) && mustSee.length > 0
      ? `Must-visit places / experiences: ${mustSee.join(', ')}.`
      : '';

  const specialText = specialRequests
    ? `Special requests / notes: ${specialRequests}.`
    : '';

  const groupDescription =
    children > 0
      ? `${adults} adult${adults !== 1 ? 's' : ''} and ${children} child${children !== 1 ? 'ren' : ''}`
      : `${adults} adult${adults !== 1 ? 's' : ''}`;

  return `You are an expert travel planner. Create a detailed, day-by-day travel itinerary based on the following parameters.

TRIP DETAILS:
- Destination: ${location}
- Dates: ${startDate} to ${endDate} (${totalDays} day${totalDays !== 1 ? 's' : ''})
- Travellers: ${groupDescription}
- Budget: ₹${budget.toLocaleString('en-IN')} ${budgetLabel}
- Accommodation: ${accommodationType}
- Travel pace: ${paceDetail}
- Trip style: ${stylesText}
${mustSeeText}
${specialText}

FORMATTING RULES (follow exactly):
1. Start with a short 2–3 sentence trip overview.
2. For each day use this exact heading: ## Day N – <Theme> (e.g. ## Day 1 – Arrival & Exploration)
3. Under each day, list activities as a numbered list. Each activity must include:
   - Time (e.g. 9:00 AM)
   - Activity name in **bold**
   - 1–2 sentence description
   - Estimated cost in ₹ (Indian Rupees)
4. End each day with a "💡 Tip" line relevant to that day.
5. After all days, add a ## Budget Summary section with a table:
   | Category | Estimated Cost |
6. Close with a ## Travel Tips section with 3–5 practical bullet points.

Respond in plain Markdown. Do not add any commentary outside the itinerary structure.`;
};

export default buildItineraryPrompt;
