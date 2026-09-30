import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <h1 className="grid flex-1 place-items-center text-2xl font-bold">Home Page</h1>
    </div>
  );
}
