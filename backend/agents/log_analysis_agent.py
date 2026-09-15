import re

class LogAnalysisAgent:
    @staticmethod
    def parse_stack_trace(stack_trace: str) -> dict:
        if not stack_trace:
            return {"error": "No stack trace provided"}
            
        result = {
            "exception_type": "Unknown",
            "root_file": "Unknown",
            "error_line": "Unknown",
            "frames": []
        }
        
        # Extract Exception Type
        exc_match = re.search(r'([a-zA-Z0-9_]+Exception|[a-zA-Z0-9_]+Error):', stack_trace)
        if exc_match:
            result["exception_type"] = exc_match.group(1)
            
        # Parse frames (Java/Python generic format)
        lines = stack_trace.split('\n')
        for line in lines:
            if 'File "' in line and 'line' in line:
                # Python format
                match = re.search(r'File "(.*?)", line (\d+), in (.*)', line)
                if match:
                    result["frames"].append({
                        "file": match.group(1),
                        "line": match.group(2),
                        "function": match.group(3)
                    })
            elif 'at ' in line and '(' in line:
                # Java format
                match = re.search(r'at (.*?)\((.*?):(\d+)\)', line)
                if match:
                    result["frames"].append({
                        "class_method": match.group(1),
                        "file": match.group(2),
                        "line": match.group(3)
                    })
                    
        if result["frames"]:
            # Assume top frame is root
            root_frame = result["frames"][0]
            if "file" in root_frame:
                result["root_file"] = root_frame["file"]
            if "line" in root_frame:
                result["error_line"] = root_frame["line"]
                
        return result
