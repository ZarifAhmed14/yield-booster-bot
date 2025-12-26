import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropType, variety, soilPh, location, weather, fertilizerLevel, irrigationNeeded, language } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstruction = language === "bn" 
      ? "Respond in Bengali (বাংলা) language only." 
      : "Respond in English only.";

    const systemPrompt = `You are an expert agricultural advisor for farmers in Bangladesh. ${languageInstruction} Give practical, actionable farming advice in 3-4 sentences. Be professional and encouraging. Focus on immediate actions the farmer should take. IMPORTANT: Do NOT use any religious greetings or phrases like Namaste, Assalamualaikum, Bismillah, or any other religious words. Keep the advice purely agricultural and secular.`;

    const userPrompt = `
Crop: ${cropType} (variety: ${variety})
Location: ${location}, Bangladesh
Soil pH: ${soilPh}
Weather: ${weather.weather}, Temperature: ${weather.temperature}°C, Humidity: ${weather.humidity}%, Rainfall: ${weather.rainfall}mm
Soil Moisture: ${weather.soil_moisture}%
Fertilizer Level Needed: ${fertilizerLevel}
Irrigation Needed: ${irrigationNeeded ? "Yes" : "No"}

Provide 3-4 lines of personalized farming advice for this specific situation.`;

    console.log("Generating advice for:", { cropType, variety, location, language });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || "Unable to generate advice at this time.";

    console.log("Generated advice successfully");

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-advice function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
