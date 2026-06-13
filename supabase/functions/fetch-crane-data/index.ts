import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CraneData {
  hoist_hours: number;
  trolley_hours: number;
  gantry_hours: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = "https://sagt-data.rwitter.cloud/get_hoist_hours_";

    const hoistIds = [
      "02","03","04","05","06","07","08","09","10","11",
      "13","15","17","18","20","22","23","24","25","26",
      "27","28","29","30","31","32","33","34","35","36","37"
    ];

    const RTIdsRefurbished = [
      "02","04","08","09","13","15","17","23","29","30","31","32","33","34","35","36","37"
    ];

    const timestamp = new Date();
    const results = [];
    const errors = [];

    const fetchPromises = hoistIds.map(async (id) => {
      const url = baseUrl + id;
      try {
        const response = await fetch(url);
        const data: CraneData = await response.json();

        const divisor = RTIdsRefurbished.includes(id) ? 60 : 1;

        return {
          crane_id: `RT ${id}`,
          hoist_hours: data.hoist_hours / divisor,
          trolley_hours: data.trolley_hours / divisor,
          gantry_hours: data.gantry_hours / divisor,
          timestamp: timestamp.toISOString(),
        };
      } catch (e) {
        errors.push({ crane: `RT ${id}`, error: String(e) });
        return null;
      }
    });

    const fetchedData = await Promise.all(fetchPromises);
    const validData = fetchedData.filter((item) => item !== null);

    if (validData.length > 0) {
      const { error: batchError } = await supabase
        .from('crane_readings')
        .insert(validData);

      if (batchError) {
        errors.push({ error: `Batch insert failed: ${batchError.message}` });
      } else {
        validData.forEach((item) => {
          results.push({ crane: item.crane_id, success: true });
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: timestamp.toISOString(),
        processed: results.length,
        errors: errors.length,
        results,
        errors
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
