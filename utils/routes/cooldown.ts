import { abi } from "@/abis/abi";
import { getPublicClient } from "@/client-singleton";
import { hamsterRaceV1 } from "@/utils/variables";

const publicClient = getPublicClient();

async function getIsInCooldown(tokenId: number) {
  const cooldown = await publicClient.readContract({
    abi,
    address: hamsterRaceV1,
    functionName: "cooldownEnd",
    args: [BigInt(tokenId)],
  });

  const now = new Date(new Date().toString().slice(0, -3));

  const isOnCooldown = new Date(Number(`${cooldown}000`)) > now;

  return isOnCooldown;
}

export { getIsInCooldown };
