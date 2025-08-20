import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ListCountries, Country, Holiday } from "@/types";

interface PageProps {
  countries: Country[];
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const response = await fetch('https://raw.githubusercontent.com/kubra-kzlk/holidayplanner/main/dataset.json');
  const jsonData = await response.json();
  const data: ListCountries = await jsonData.json();

  const countries: Country[] = data.countries
    .map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      holidays: (c.holidays ?? [])
        .map<Holiday>((h) => ({ ...h, date: new Date(h.date) as unknown as Date }))
        .sort(
          (a, b) =>
            new Date(a.date as unknown as string).getTime() -
            new Date(b.date as unknown as string).getTime()
        ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { props: { countries } };
};


export default function HomePage({ countries }: PageProps) {
  return (
    <>
      <Head>
        <title>Holiday Planner • Home</title>
      </Head>
      <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Countries & Holidays</h1>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {countries.map((c) => (
            <section key={c.id} style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
              <h2 style={{ margin: 0 }}>
                {c.name} <small>({c.code})</small>
              </h2>
              {c.holidays.length === 0 ? (
                <p style={{ marginTop: 8, opacity: 0.7 }}>No holidays listed.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
                  {c.holidays.map((h) => {
                    const d = new Date(h.date as unknown as string);
                    const label = isNaN(d.getTime())
                      ? String(h.date)
                      : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
                    return (
                      <li key={h.id} style={{ padding: "0.5rem 0", borderTop: "1px solid #f0f0f0" }}>
                        <Link href={`/countries/${c.id}`} aria-label={`Details ${c.name}`}>
                          <strong>{h.name}</strong> • {label} • {h.type}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

