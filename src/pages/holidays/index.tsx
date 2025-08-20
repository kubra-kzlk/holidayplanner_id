import Head from "next/head";
import { useMemo, useState } from "react";
import type { GetStaticProps } from "next";
import type { ListCountries, OutputHoliday, HolidaysByYearResponse } from "@/types";

interface PageProps {
    holidays: OutputHoliday[]; // platte lijst
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
    const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
    const jsonData = await response.json();
    const data: ListCountries = await jsonData.json();
    return { props: { holidays: flattenAll(data) }, revalidate: 600 };
};

function flattenAll(data: ListCountries): HolidaysByYearResponse {
    return data.countries
        .flatMap((c) =>
            (c.holidays ?? []).map<OutputHoliday>((h) => ({
                ...h,
                date: new Date(h.date) as unknown as Date,
                countryCode: c.code,
                countryName: c.name,
            }))
        )
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export default function AllHolidaysPage({ holidays }: PageProps) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return s ? holidays.filter((h) => h.name.toLowerCase().includes(s)) : holidays;
    }, [q, holidays]);

    return (
        <>
            <Head>
                <title>All Holidays</title>
            </Head>
            <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
                <h1>All Holidays</h1>

                <div style={{ margin: "1rem 0" }}>
                    <label htmlFor="q" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                        Search by holiday name
                    </label>
                    <input
                        id="q"
                        type="search"
                        placeholder="e.g. Independence, Armistice…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #ccc" }}
                        aria-describedby="count"
                    />
                    <div id="count" style={{ marginTop: 6, opacity: 0.75 }}>
                        Showing <strong>{filtered.length}</strong> of {holidays.length}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p>No holidays match your search.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {filtered.map((h) => (
                            <li key={`${h.countryCode}-${h.id}`} style={{ padding: "0.6rem 0", borderBottom: "1px solid #eee" }}>
                                <strong>{h.name}</strong> — {h.countryName} ({h.countryCode})
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </>
    );
}


