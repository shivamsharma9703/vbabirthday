import { useExperience } from "@/lib/experience/state";
import { Button } from "@/components/ui/button";
export function PreviewBar() {
  const { previewToken, exit } = useExperience();
  if (!previewToken) return null;
  return (
    <div className="preview-bar fixed inset-x-0 top-0 z-[100] flex h-12 items-center justify-between border-b border-border bg-background px-4 text-foreground">
      <span className="font-mono text-xs">PREVIEW MODE</span>
      <Button variant="ghost" onClick={exit} className="text-xs">
        Exit preview
      </Button>
    </div>
  );
}
