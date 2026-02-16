const FUNDME_ABI = [
  "function fund() payable",
  "function donorsCount() view returns (uint256)",
  "function donors(uint256) view returns (address)",
  "function donations(address) view returns (uint256)",
  "function getUsdValue(uint256) view returns (uint256)",
  "function MIN_USD() view returns (uint256)",
  "function owner() view returns (address)",
  "function withdraw()",
];

const connectBtn = document.getElementById("connectBtn");
const accountStatus = document.getElementById("accountStatus");
const chainIdInput = document.getElementById("chainId");
const networkSelect = document.getElementById("networkSelect");
const contractAddressInput = document.getElementById("contractAddress");
const fundAmountInput = document.getElementById("fundAmount");
const estimateBtn = document.getElementById("estimateBtn");
const estimateEl = document.getElementById("estimate");
const fundBtn = document.getElementById("fundBtn");
const fundStatus = document.getElementById("fundStatus");
const refreshBtn = document.getElementById("refreshBtn");
const donorCountEl = document.getElementById("donorCount");
const donorListEl = document.getElementById("donorList");
const withdrawBtn = document.getElementById("withdrawBtn");


let provider;
let signer;
let contract;

const networkConfig = window.FUNDME_NETWORKS || {};
const defaultNetwork = window.FUNDME_DEFAULT_NETWORK || "localhost";

if (networkSelect) {
  networkSelect.value = defaultNetwork;
}

const applyNetwork = (networkKey) => {
  const config = networkConfig[networkKey];
  if (!config) {
    return;
  }
  contractAddressInput.value = config.contractAddress || "";
};

applyNetwork(defaultNetwork);

const setStatus = (element, message, type) => {
  element.textContent = message;
  element.classList.remove("success", "error");
  if (type) {
    element.classList.add(type);
  }
};

const extractErrorMessage = (error) => {
  if (!error) {
    return "交易失败";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error.shortMessage) {
    return error.shortMessage;
  }
  if (error.reason) {
    return error.reason;
  }
  if (error.info?.error?.message) {
    return error.info.error.message;
  }
  if (error.message) {
    return error.message;
  }
  return "交易失败";
};

const getContractAddress = () => contractAddressInput.value.trim();

const buildContract = () => {
  const address = getContractAddress();
  if (!address) {
    throw new Error("请填写合约地址");
  }
  if (!signer) {
    throw new Error("请先连接钱包");
  }
  contract = new ethers.Contract(address, FUNDME_ABI, signer);
};

const formatEth = (value) => {
  try {
    return `${Number(ethers.formatEther(value)).toFixed(6)} ETH`;
  } catch {
    return "0.000000 ETH";
  }
};

const formatUsd = (value) => {
  try {
    return Number(ethers.formatUnits(value, 8)).toFixed(2);
  } catch {
    return "0.00";
  }
};

const normalizeAmount = (value) => value.replace(/,/g, "").trim();

const toWeiFromEthInput = (value) => {
  const normalized = normalizeAmount(value);
  if (!normalized || Number(normalized) <= 0) {
    throw new Error("请输入有效的 ETH 金额");
  }
  return ethers.parseUnits(normalized, 18);
};

const formatUsdInteger = (value) => {
  try {
    return (value / 100000000n).toString();
  } catch {
    return "0";
  }
};

const connectWallet = async () => {
  if (!window.ethereum) {
    setStatus(accountStatus, "未检测到 MetaMask", "error");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  accountStatus.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
  chainIdInput.value = network.chainId.toString();
  buildContract();
  await loadDonors();
  await loadContractBalance();
  await checkOwnerAndToggle();
};

const estimateDonation = async () => {
  if (!contract) {
    setStatus(fundStatus, "请先连接钱包", "error");
    return;
  }

  try {
    const weiAmount = toWeiFromEthInput(fundAmountInput.value);
    const usdValue = await contract.getUsdValue(weiAmount);
    estimateEl.textContent = `$${formatUsd(usdValue)}`;
    setStatus(fundStatus, "估算完成", "success");
  } catch (error) {
    setStatus(fundStatus, extractErrorMessage(error) || "估算失败", "error");
  }
};

const fund = async () => {
  if (!contract) {
    setStatus(fundStatus, "请先连接钱包", "error");
    return;
  }

  let weiAmount;

  try {
    setStatus(fundStatus, "交易发送中...", "success");
    weiAmount = toWeiFromEthInput(fundAmountInput.value);
    const usdValue = await contract.getUsdValue(weiAmount);
    const minUsd = await contract.MIN_USD();
    if (usdValue < minUsd) {
      setStatus(
        fundStatus,
        `FundMe: minimum is $50, current value is $${formatUsdInteger(usdValue)}`,
        "error"
      );
      return;
    }
    const tx = await contract.fund({ value: weiAmount });
    await tx.wait();
    setStatus(fundStatus, "捐赠成功", "success");
    await loadDonors();
    await loadContractBalance();
  } catch (error) {
    let message = extractErrorMessage(error) || "捐赠失败";
    if (message.includes("missing revert data") && weiAmount) {
      try {
        await contract.fund.staticCall({ value: weiAmount });
      } catch (staticError) {
        message = extractErrorMessage(staticError) || message;
      }
    }
    setStatus(fundStatus, message, "error");
  }
};

const contractBalanceEl = document.getElementById("contractBalance");

const loadContractBalance = async () => {
  try {
    const address = getContractAddress();
    if (!address) return;
    const bal = await provider.getBalance(address);
    contractBalanceEl.textContent = `${Number(ethers.formatEther(bal)).toFixed(6)} ETH`;
  } catch (error) {
    // ignore
  }
};

const checkOwnerAndToggle = async () => {
  try {
    const ownerAddr = await contract.owner();
    const current = await signer.getAddress();
    if (ownerAddr && current && ownerAddr.toLowerCase() === current.toLowerCase()) {
      withdrawBtn.style.display = "";
      withdrawBtn.classList.remove("secondary");
      withdrawBtn.classList.add("primary");
    } else {
      withdrawBtn.style.display = "none";
    }
  } catch (error) {
    withdrawBtn.style.display = "none";
  }
};

const withdraw = async () => {
  if (!contract) return;
  try {
    setStatus(fundStatus, "发送提现交易...", "success");
    const tx = await contract.withdraw();
    await tx.wait();
    setStatus(fundStatus, "提现成功", "success");
    await loadDonors();
    await loadContractBalance();
  } catch (error) {
    setStatus(fundStatus, extractErrorMessage(error) || "提现失败", "error");
  }
};

const loadDonors = async () => {
  if (!contract) {
    return;
  }

  try {
    donorListEl.innerHTML = "";
    const count = await contract.donorsCount();
    const total = Number(count);
    donorCountEl.textContent = total.toString();

    for (let i = 0; i < total; i += 1) {
      const donor = await contract.donors(i);
      const amount = await contract.donations(donor);
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <span>${donor}</span>
        <span>${formatEth(amount)}</span>
      `;
      donorListEl.appendChild(row);
    }
  } catch (error) {
    setStatus(fundStatus, extractErrorMessage(error) || "加载捐赠人失败", "error");
  }
};

connectBtn.addEventListener("click", connectWallet);
estimateBtn.addEventListener("click", estimateDonation);
fundBtn.addEventListener("click", fund);
refreshBtn.addEventListener("click", loadDonors);
withdrawBtn.addEventListener("click", withdraw);

if (networkSelect) {
  networkSelect.addEventListener("change", async (event) => {
    applyNetwork(event.target.value);
    if (signer) {
      try {
        buildContract();
        await loadDonors();
        await loadContractBalance();
        await checkOwnerAndToggle();
      } catch (error) {
        setStatus(fundStatus, extractErrorMessage(error) || "切换网络失败", "error");
      }
    }
  });
}

if (window.ethereum) {
  window.ethereum.on("accountsChanged", connectWallet);
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
