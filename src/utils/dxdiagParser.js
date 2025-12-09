/**
 * DXDiag File Parser - Frontend version
 * Parses DXDiag output text file and extracts system information
 * This provides better parsing before sending to backend
 */

export const parseDXDiagFile = async (file) => {
  try {
    const content = await file.text();
    return parseDXDiagContent(content);
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

export const parseDXDiagContent = (content) => {
  const systemInfo = {
    os: "Unknown",
    cpu: "Unknown",
    gpu: "Unknown",
    ram: "Unknown",
    directX: "Unknown"
  };

  try {
    // Parse Operating System
    systemInfo.os = parseOS(content);

    // Parse RAM - multiple patterns to handle different DXDiag versions
    systemInfo.ram = parseRAM(content);

    // Parse Processor/CPU
    systemInfo.cpu = parseCPU(content);

    // Parse GPU - look for Display Devices section
    systemInfo.gpu = parseGPU(content);

    // Parse DirectX Version
    systemInfo.directX = parseDirectX(content);

    console.log("✅ Parsed DXDiag content:", systemInfo);
    return systemInfo;
  } catch (error) {
    console.error("Error parsing DXDiag content:", error);
    return systemInfo;
  }
};

function parseOS(content) {
  // Pattern 1: "Operating System: Windows 10 (or later)..."
  let match = content.match(/Operating System\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    let os = match[1].trim();
    // Clean up extra info
    os = os.split("\n")[0].trim();
    if (os && os !== "Unknown") return os;
  }

  // Pattern 2: Look for "System Model" section
  match = content.match(/System Model\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return "Unknown";
}

function parseRAM(content) {
  // Pattern 1: "Physical Memory: 16384 MB" or "Memory: 16384 MB"
  let match = content.match(/(?:Physical\s+)?Memory\s*:\s*(\d+)\s*MB/i);
  if (match && match[1]) {
    const ramMB = parseInt(match[1]);
    const ramGB = Math.round(ramMB / 1024);
    if (ramGB > 0) return `${ramGB} GB`;
  }

  // Pattern 2: "Installed RAM: 16 GB"
  match = content.match(/Installed\s+RAM\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Pattern 3: "Total Memory: 16384 MB"
  match = content.match(/Total\s+Memory\s*:\s*(\d+)\s*MB/i);
  if (match && match[1]) {
    const ramMB = parseInt(match[1]);
    const ramGB = Math.round(ramMB / 1024);
    if (ramGB > 0) return `${ramGB} GB`;
  }

  return "Unknown";
}

function parseCPU(content) {
  // Pattern 1: "Processor: Intel(R) Core(TM) i7-9700K..."
  let match = content.match(/Processor\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    let cpu = match[1].trim();
    // Remove extra info like "(8 CPUs)" or "@3.6 GHz"
    cpu = cpu.replace(/\s*\(\d+\s*CPUs?\s*\)/gi, "");
    cpu = cpu.replace(/\s*@\s*.+/i, "");
    cpu = cpu.replace(/\s+/g, " ").trim();
    if (cpu && cpu !== "Unknown") return cpu;
  }

  // Pattern 2: "CPU: Intel Core i7-9700K"
  match = content.match(/CPU\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return "Unknown";
}

function parseGPU(content) {
  let gpu = "";

  // Look for "Card name" in Display Devices section
  let match = content.match(/Card\s+name\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    gpu = match[1].trim();
  }

  // Try to find VRAM info
  match = content.match(/(?:Approx\.\s+)?Total\s+Memory\s*:\s*(\d+)\s*MB/i);
  if (match && match[1]) {
    const vramMB = parseInt(match[1]);
    const vramGB = Math.round(vramMB / 1024);
    if (vramGB > 0) {
      gpu = gpu ? `${gpu} (${vramGB}GB VRAM)` : `${vramGB}GB VRAM`;
    }
  }

  // Try alternative VRAM pattern
  if (!gpu) {
    match = content.match(/VRAM\s*:\s*(.+?)(?:\n|$)/i);
    if (match && match[1]) {
      gpu = match[1].trim();
    }
  }

  // Try DirectX device name
  if (!gpu) {
    match = content.match(/Device\s+Name\s*:\s*(.+?)(?:\n|$)/i);
    if (match && match[1]) {
      gpu = match[1].trim();
    }
  }

  return gpu || "Unknown";
}

function parseDirectX(content) {
  // Pattern: "DirectX Version: 12 (12.0)"
  let match = content.match(/DirectX\s+Version\s*:\s*(.+?)(?:\n|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return "Unknown";
}

/**
 * Extract system info from DXDiag file for debugging
 */
export const extractDebugInfo = (content) => {
  console.log("===== DXDiag File Content Preview =====");
  console.log(content.substring(0, 1000));
  console.log("=======================================");
};
