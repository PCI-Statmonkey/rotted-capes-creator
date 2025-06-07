import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Maneuver = {
  id: number;
  name: string;
  type: string;
  requirements?: string | null;
};

export default function AdminManeuvers() {
  const [maneuvers, setManeuvers] = useState<Maneuver[]>([]);
  const [editing, setEditing] = useState<Maneuver | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    requirements: "",
  });

  useEffect(() => {
    apiRequest('GET', '/api/game-content/maneuvers')
      .then(res => res.json())
      .then(setManeuvers);
  }, []);

  const openEditor = (maneuver?: Maneuver) => {
    if (maneuver) {
      setEditing(maneuver);
      setFormData({
        name: maneuver.name,
        type: maneuver.type,
        requirements: maneuver.requirements || "",
      });
    } else {
      setEditing(null);
      setFormData({ name: "", type: "", requirements: "" });
    }
    setModalOpen(true);
  };

  const saveManeuver = async () => {
    if (editing) {
      const res = await apiRequest('PUT', `/api/game-content/maneuvers/${editing.id}`, formData);
      const data = await res.json();
      setManeuvers((prev) => prev.map((m) => (m.id === editing.id ? data : m)));
    } else {
      const res = await apiRequest('POST', '/api/game-content/maneuvers', formData);
      const data = await res.json();
      setManeuvers((prev) => [...prev, data]);
    }
    setModalOpen(false);
  };

  const deleteManeuver = async (id: number) => {
    await apiRequest('DELETE', `/api/game-content/maneuvers/${id}`);
    setManeuvers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-display font-bold mb-4">Manage Maneuvers</h1>
      <Button onClick={() => openEditor()}>+ Add Maneuver</Button>

      <ul className="mt-6 space-y-3">
        {maneuvers.map((m) => (
          <li key={m.id} className="border p-4 rounded-lg flex justify-between">
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-600">{m.type}</p>
              {m.requirements && (
                <p className="text-xs text-gray-500">Requires: {m.requirements}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEditor(m)}>Edit</Button>
              <Button variant="destructive" onClick={() => deleteManeuver(m.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <div className="p-4 space-y-4 bg-white rounded-md shadow-md w-full max-w-md mx-auto mt-10">
          <h2 className="text-lg font-bold">{editing ? "Edit" : "Add"} Maneuver</h2>
          <input
            className="w-full border rounded px-2 py-1"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="w-full border rounded px-2 py-1"
            placeholder="Type (e.g., Combat, Leadership)"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <input
            className="w-full border rounded px-2 py-1"
            placeholder="Requirements (optional)"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveManeuver}>Save</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
