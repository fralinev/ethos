export const revalidate = 0;

type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

function getApiBase() {
  const host = process.env.API_HOST; // e.g. "ethos-api-vbj7"
  if (!host) return "http://localhost:4000";

  const fqdn = host.includes(".") ? host : `${host}.onrender.com`;

  if (process.env.NODE_ENV === "production") {
    return `https://${fqdn}`; // public URL on 443
  }
  // local/dev or Docker
  const port = process.env.API_PORT;
  return port ? `http://${fqdn}:${port}` : `http://${fqdn}`;
}

async function getUsers(): Promise<User[]> {
  // const API_URL = process.env.API_HOST ?? "http://localhost:4000";
  const res = await fetch(`${getApiBase()}/api/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      <table className="min-w-full text-sm border rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
