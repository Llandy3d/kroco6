import * as scripts from "@/lib/example-scripts";

import { Button } from "@/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface ScriptExamplesProps {
  onSelect: (script: string) => void;
}

function ScriptExamples({ onSelect }: ScriptExamplesProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          Script examples
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Authentication/Authorization</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onSelect(scripts.BASIC_AUTHENTICATION)}
          >
            Basic Authentication
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSelect(scripts.DIGEST_AUTHENTICATION)}
          >
            Digest Authentication
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>API CRUD operations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSelect(scripts.CORE_K6_API)}>
            Core k6 APIs example
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Cookies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSelect(scripts.COOKIES_HEADER)}>
            Accessing a cookie set in response headers
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSelect(scripts.COOKIES_LOG_RESPONSE)}
          >
            Logging all cookies in response
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect(scripts.COOKIES_SET_JAR)}>
            Setting a cookie in VU cookie jar
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Correlation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSelect(scripts.EXTRACT_JSON)}>
            Extracting values from JSON response
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ScriptExamples };
