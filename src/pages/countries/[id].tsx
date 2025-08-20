import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { ListCountries, Country, Holiday } from "@/types";


interface PageProps {
    country: Country;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
    const jsonData = await response.json();
    const data: ListCountries = await jsonData.json();

    const paths = data.countries.map((c) => ({ params: { id: String(c.id) } }));
    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
    const idParam = ctx.params?.id;
    const idNum = Number(Array.isArray(idParam) ? idParam[0] : idParam);
    if (!Number.isInteger(idNum)) return { notFound: true };

    const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
    const jsonData = await response.json();
    const data: ListCountries = await jsonData.json();

    const found = data.countries.find((c) => c.id === idNum);
    if (!found) return { notFound: true };

    const holidays: Holiday[] = (found.holidays ?? [])
        .map((h) => ({ ...h, date: new Date(h.date) as unknown as Date }))
        .sort(
            (a, b) =>
                new Date(a.date as unknown as string).getTime() -
                new Date(b.date as unknown as string).getTime()
        );

    const country: Country = {
        id: found.id,
        code: found.code,
        name: found.name,
        holidays,
    };

    return { props: { country }, revalidate: 600 };
};


export default function CountryDetailPage({ country }: PageProps) {
    return (
        <>
            <Head>
                <title>
                    {country.name} ({country.code})
                </title>
            </Head>
            <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
                <h1>
                    {country.name} <small>({country.code})</small>
                </h1>

                {country.holidays.length === 0 ? (
                    <p>No holidays found.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {country.holidays.map((h) => {
                            const d = new Date(h.date as unknown as string);
                            const label = isNaN(d.getTime())
                                ? String(h.date)
                                : d.toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                });
                            return (
                                <li key={h.id} style={{ padding: "0.6rem 0", borderBottom: "1px solid #eee" }}>
                                    <div style={{ fontWeight: 600 }}>{h.name}</div>
                                    <div style={{ opacity: 0.85 }}>
                                        {label} • {h.type} • {h.year}
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

