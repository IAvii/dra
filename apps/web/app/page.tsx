import { Button } from '@draw/ui/button';

export default function Home() {
  return (
    <div className="w:full col-auto">
      <h1 className="text-3xl font-bold bg-yellow-900 underline">Hello world!</h1>
      <Button appName="web"> Save</Button>
    </div>
  );
}
