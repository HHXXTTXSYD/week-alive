import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
export function SearchForm({
  initial = "",
  large = false,
}: {
  initial?: string;
  large?: boolean;
}) {
  return (
    <form className={`search-form ${large ? "large" : ""}`} action="/companies">
      <Search size={21} />
      <Input
        name="q"
        defaultValue={initial}
        aria-label="搜索公司、城市或岗位"
        placeholder="搜索公司、城市或岗位，找到你的理想工作"
      />
      <Button type="submit">
        搜索公司 <ArrowRight size={17} />
      </Button>
    </form>
  );
}
