export const abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_nft", type: "address", internalType: "contract OGsNFT" },
      {
        name: "_directory",
        type: "address",
        internalType: "contract AgentDirectoryV1",
      },
      { name: "_feeReceiver", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DIRECTORY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AgentDirectoryV1",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "NFT",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract OGsNFT" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "banHamsterAgent",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelCommitment",
    inputs: [
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "commitToRace",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "contract IAgentV1",
      },
      {
        name: "betToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "betSize", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint64", internalType: "uint64" },
      { name: "count", type: "uint64", internalType: "uint64" },
    ],
    outputs: [
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "commitmentLock",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "commitmentLockPeriod",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cooldownEnd",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "countUsed",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "disableBetSize",
    inputs: [{ name: "_betSize", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "disableBetToken",
    inputs: [
      {
        name: "_betToken",
        type: "address",
        internalType: "contract IERC20",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emergencyRecover",
    inputs: [
      { name: "token", type: "address", internalType: "contract IERC20" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "enableBetSize",
    inputs: [{ name: "_betSize", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "enableBetToken",
    inputs: [
      {
        name: "_betToken",
        type: "address",
        internalType: "contract IERC20",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "enableRoundTwoRacing",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "enabledBetSizes",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "enabledBetTokens",
    inputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "enabledHamsterAgents",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "executeRace",
    inputs: [
      {
        name: "commitmentHashes",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feePercent",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeReceiver",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDefinition",
    inputs: [],
    outputs: [{ name: "game", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getReward",
    inputs: [
      { name: "newXPos", type: "uint256", internalType: "uint256" },
      { name: "newYPos", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "reward", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "isAgentInCooldown",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRoundTwoEnabled",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidCommitment",
    inputs: [
      {
        name: "agent",
        type: "address",
        internalType: "contract IAgentV1",
      },
      {
        name: "betToken",
        type: "address",
        internalType: "contract IERC20",
      },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "betSize", type: "uint256", internalType: "uint256" },
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "valid", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidHamsterAgent",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "raceCommitments",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [
      { name: "player", type: "address", internalType: "address" },
      { name: "agent", type: "address", internalType: "address" },
      { name: "betToken", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "betSize", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint64", internalType: "uint64" },
      { name: "count", type: "uint64", internalType: "uint64" },
      { name: "rngSeed", type: "uint128", internalType: "uint128" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "raceId",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "racesPerPeriod",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCommitmentLockPeriod",
    inputs: [
      {
        name: "_commitmentLockPeriod",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeePercent",
    inputs: [{ name: "_feePercent", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeReceiver",
    inputs: [
      { name: "_feeReceiver", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistHamsterAgent",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BetSizeDisabled",
    inputs: [
      {
        name: "betSize",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BetSizeEnabled",
    inputs: [
      {
        name: "betSize",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BetTokenDisabled",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BetTokenEnabled",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CommitmentLockPeriodSet",
    inputs: [
      {
        name: "lockPeriod",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeePercentSet",
    inputs: [
      {
        name: "feePercent",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeReceiverSet",
    inputs: [
      {
        name: "feeReceiver",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlayerCommitted",
    inputs: [
      {
        name: "commitment",
        type: "tuple",
        indexed: false,
        internalType: "struct IHamsterRaceV1.RaceCommitment",
        components: [
          { name: "player", type: "address", internalType: "address" },
          { name: "agent", type: "address", internalType: "address" },
          { name: "betToken", type: "address", internalType: "address" },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "betSize", type: "uint256", internalType: "uint256" },
          { name: "deadline", type: "uint64", internalType: "uint64" },
          { name: "count", type: "uint64", internalType: "uint64" },
          { name: "rngSeed", type: "uint128", internalType: "uint128" },
        ],
      },
      {
        name: "commitmentHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RaceFinished",
    inputs: [
      {
        name: "winningTokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "winner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "executor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "betToken",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "betSize",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "raceId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "steps",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "commitmentHashes",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoundTwoRacingEnabled",
    inputs: [],
    anonymous: false,
  },
  {
    type: "error",
    name: "AgentInCooldown",
    inputs: [
      { name: "timeRemaining", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "CommitmentExpired",
    inputs: [
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "CommitmentLocked",
    inputs: [{ name: "lockedUntil", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "CommitmentOverused",
    inputs: [
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "DuplicateCommitment",
    inputs: [
      { name: "commitmentHash", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "DuplicatePet",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "FeePercentTooHigh",
    inputs: [
      { name: "maxFeePercent", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "GameFailed",
    inputs: [{ name: "steps", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "IncompatibleAgents",
    inputs: [
      {
        name: "executingAgent",
        type: "address",
        internalType: "address",
      },
      {
        name: "commitmentAgent",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "InsufficientAllowance",
    inputs: [{ name: "betSize", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [{ name: "betSize", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "InvalidBetSize",
    inputs: [
      {
        name: "commitmentBetSize",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidBetToken",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidCommitmentDeadline",
    inputs: [
      {
        name: "commitmentLockPeriod",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidCommitmentLength",
    inputs: [
      { name: "length", type: "uint256", internalType: "uint256" },
      { name: "expectedLength", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "InvalidCommitmentLockPeriod",
    inputs: [
      {
        name: "maxCommitmentLockPeriod",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  { type: "error", name: "InvalidCommitmentPlayer", inputs: [] },
  {
    type: "error",
    name: "InvalidHamsterAgent",
    inputs: [{ name: "agent", type: "address", internalType: "address" }],
  },
  { type: "error", name: "InvalidRound", inputs: [] },
  {
    type: "error",
    name: "InvalidTokenId",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
] as const;
