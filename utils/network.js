import * as Network from 'expo-network';

export const getLocalIp = async () => {
  try {
    const ip = await Network.getIpAddressAsync();
    return ip;
  } catch {
    return '0.0.0.0';
  }
};

export const getPublicIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
};
