import type { NextApiRequest, NextApiResponse } from "next";
import type { ListCountries, OutputHoliday, HolidaysByYearResponse } from "@/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HolidaysByYearResponse | { error: string }>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const y = req.query.year;
    const year = Number(Array.isArray(y) ? y[0] : y);
    if (!Number.isInteger(year)) {
        return res.status(400).json({ error: "Invalid or missing year parameter" });
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
        const jsonData = await response.json();
        const data: ListCountries = await jsonData.json();

        const flat: HolidaysByYearResponse = data.countries
            .flatMap((c) =>
                (c.holidays ?? [])
                    .filter((h) => h.year === year)
                    .map<OutputHoliday>((h) => ({
                        ...h,
                        date: new Date(h.date) as unknown as Date,
                        countryCode: c.code,
                        countryName: c.name,
                    }))
            )
            .sort(
                (a, b) =>
                    new Date(a.date as unknown as string).getTime() -
                    new Date(b.date as unknown as string).getTime()
            );

        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json(flat);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to load holidays data" });
    }
}
