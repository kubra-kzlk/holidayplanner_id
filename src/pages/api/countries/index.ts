import type { NextApiRequest, NextApiResponse } from "next";
import type { ListCountries, Country } from "@/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ countries: Pick<Country, "code" | "name">[] } | { error: string }>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
        const jsonData = await response.json();
        const data: ListCountries = await jsonData.json();
        const countries = data.countries.map((c) => ({ code: c.code, name: c.name }));

        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json({ countries });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load countries data" });
    }
}
