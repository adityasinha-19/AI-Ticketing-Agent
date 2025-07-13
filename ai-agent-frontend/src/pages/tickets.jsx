import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("failed to fetch tickets", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: [e.target.value] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); //refresh list
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (error) {
      alert("Error creating Ticket");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          placeholder="Ticket Title"
          value={form.title}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">All tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket._id}
            className="card shadow-md p-4 bg-gray-800"
            to={`/tickets/${ticket._id}`}
          >
            <h3 className="font-bold text-lg">{ticket.title}</h3>
            <p className="text-sm">{ticket.description}</p>
            <p className="text-sm">
              Created At: {new Date(ticket.createdAt).toLocaleString}
            </p>
          </Link>
        ))}
        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>
    </div>
  );
}

export default Tickets;
