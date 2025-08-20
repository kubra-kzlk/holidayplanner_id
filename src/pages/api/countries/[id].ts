import type { NextApiRequest, NextApiResponse } from "next";
import type { ListCountries, Country, Holiday } from "@/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Country | { error: string }>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idParam = req.query.id;
    const idNum = Number(Array.isArray(idParam) ? idParam[0] : idParam);
    if (!Number.isInteger(idNum)) {
        return res.status(400).json({ error: "Invalid or missing id parameter" });
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
        const jsonData = await response.json();
        const data: ListCountries = await jsonData.json();
        const found = data.countries.find((c) => c.id === idNum);

        if (!found) {
            return res.status(404).json({ error: `Country with id '${idNum}' not found` });
        }

        const holidays: Holiday[] = (found.holidays ?? []).map((h) => ({
            ...h,
            // cast string -> Date om aan je types te voldoen (JSON zal ISO-string serialiseren)
            date: new Date(h.date) as unknown as Date,
        }));

        const result: Country = { id: found.id, code: found.code, name: found.name, holidays };

        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load country data" });
    }
}
