import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { ListCountries, OutputHoliday, HolidaysByYearResponse } from "@/types";



interface PageProps {
    year: number;
    holidays: OutputHoliday[];
}
export const getStaticPaths: GetStaticPaths = async () => {
    const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
    const jsonData = await response.json();
    const data: ListCountries = await jsonData.json();

    const years = Array.from(
        new Set<number>(data.countries.flatMap((c) => c.holidays.map((h) => h.year)))
    );

    return {
        paths: years.map((y) => ({ params: { year: String(y) } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
    const p = ctx.params?.year;
    const year = Number(Array.isArray(p) ? p[0] : p);
    if (!Number.isInteger(year)) return { notFound: true };

    const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
    const jsonData = await response.json();
    const data: ListCountries = await jsonData.json();

    return { props: { year, holidays: flattenByYear(data, year) }, revalidate: 600 };
};


function flattenByYear(data: ListCountries, year: number): HolidaysByYearResponse {
    return data.countries
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
}

export default function HolidaysByYearPage({ year, holidays }: PageProps) {
    return (
        <>
            <Head>
                <title>Holidays {year}</title>
            </Head>
            <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
                <h1>Holidays in {year}</h1>
                {holidays.length === 0 ? (
                    <p>No holidays found.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {holidays.map((h) => {
                            const d = new Date(h.date as unknown as string);
                            const label = isNaN(d.getTime())
                                ? String(h.date)
                                : d.toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                });
                            return (
                                <li key={`${h.countryCode}-${h.id}`} style={{ padding: "0.6rem 0", borderBottom: "1px solid #eee" }}>
                                    <div style={{ fontWeight: 600 }}>{h.name}</div>
                                    <div style={{ opacity: 0.85 }}>
                                        {h.countryName} ({h.countryCode}) • {label} • {h.type}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </>
    );
}


