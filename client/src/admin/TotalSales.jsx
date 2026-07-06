import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function formatMoney(amount) {
  const n = Number(amount) || 0;
  return `$${n.toFixed(2)}`;
}

export default function TotalSales() {
  const [loading, setLoading] = useState(true);
  const [salesByDate, setSalesByDate] = useState([]);
  const [expandedItems, setExpandedItems] = useState({}); // dateISO -> bool
  const [expandedDetails, setExpandedDetails] = useState({}); // dateISO -> bool

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/totalsales", { withCredentials: true });
      const data = res.data || {};
      setSalesByDate(Array.isArray(data.salesByDate) ? data.salesByDate : []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load total sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSales();
    })();
  }, []);

  const hasData = useMemo(() => salesByDate && salesByDate.length > 0, [salesByDate]);

  if (loading) {
    return (
      <div>
        <h1>Total Sales</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Total Sales</h1>

      {!hasData && <div>No sales recorded.</div>}

      {salesByDate.map((day) => {
        const dateISO = day.dateISO;
        const showItems = !!expandedItems[dateISO];
        const showDetails = !!expandedDetails[dateISO];

        return (
          <div key={dateISO} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{day.date}</div>
              <div>totals sales = {formatMoney(day.totalsalesAmount)}</div>
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setExpandedItems((p) => ({ ...p, [dateISO]: !p[dateISO] }))}
              >
                {showItems ? "hide total sold items" : "show total sold items"}
              </button>
              <button
                onClick={() => setExpandedDetails((p) => ({ ...p, [dateISO]: !p[dateISO] }))}
              >
                {showDetails ? "hide detail sales" : "show detail sales"}
              </button>
            </div>

            {showItems && (
              <div style={{ marginTop: 10 }}>
                {day.totalSoldItems && day.totalSoldItems.length > 0 ? (
                  <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>total sold items</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {day.totalSoldItems.map((it) => (
                        <div
                          key={it.name}
                          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                        >
                          <div style={{ fontWeight: 500, maxWidth: 280, wordBreak: "break-word" }}>
                            {it.name}
                          </div>
                          <div style={{ fontWeight: 700 }}>{it.quantity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>No items sold.</div>
                )}
              </div>
            )}

            {showDetails && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>hourly sales</div>
                <div>
                  {(day.hourly || []).map((h) => (
                    <div
                      key={h.hourLabel}
                      style={{ display: "flex", justifyContent: "space-between", maxWidth: 420 }}
                    >
                      <div>{h.hourLabel}</div>
                      <div>{formatMoney(h.amount)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 8, fontWeight: 700 }}>
                  total {formatMoney(day.totalHourAmount)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

