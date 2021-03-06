import configuredStore from 'features/store';
import {
  isValidBTCAddress,
  isValidETHAddress,
  isValidPath,
  isValidPrivKey,
  isLabelWithoutENS,
  isValidAddressLabel,
  isValidAddress
} from 'libs/validators';
import { translateRaw } from 'translations';
import { DPaths } from 'config/dpaths';
import { valid, invalid } from '../utils/testStrings';
configuredStore.getState();

const VALID_BTC_ADDRESS = '1MEWT2SGbqtz6mPCgFcnea8XmWV5Z4Wc6';
const VALID_ETH_ADDRESS = '0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8';
const VALID_RSK_TESTNET_ADDRESS = '0x5aAeb6053F3e94c9b9A09F33669435E7EF1BEaEd';
const VALID_RSK_MAINNET_ADDRESS = '0x5aaEB6053f3e94c9b9a09f33669435E7ef1bEAeD';
const VALID_ETH_PRIVATE_KEY = '3f4fd89ea4970cc77bfd2d07a95786575ea62e183857afe6301578e1a3c5c782';
const INVALID_ETH_PRIVATE_KEY = '3f4fd89ea4970cc77bfd2d07a95786575ea62e183857afe6301578e1a3c5ZZZZ';
const VALID_ETH_PRIVATE_BUFFER = Buffer.from(VALID_ETH_PRIVATE_KEY, 'hex');
const VALID_ETH_PRIVATE_0X = '0x3f4fd89ea4970cc77bfd2d07a95786575ea62e183857afe6301578e1a3c5c782';
const RSK_TESTNET_CHAIN_ID = 31;
const RSK_MAINNET_CHAIN_ID = 30;
const ETH_CHAIN_ID = 1;

describe('Validator', () => {
  it('should validate correct BTC address as true', () => {
    expect(isValidBTCAddress(VALID_BTC_ADDRESS)).toBeTruthy();
  });
  it('should validate incorrect BTC address as false', () => {
    expect(isValidBTCAddress('nonsense' + VALID_BTC_ADDRESS + 'nonsense')).toBeFalsy();
  });

  it('should validate correct ETH address as true', () => {
    expect(isValidETHAddress(VALID_ETH_ADDRESS)).toBeTruthy();
  });
  it('should validate incorrect ETH address as false', () => {
    expect(isValidETHAddress('nonsense' + VALID_ETH_ADDRESS + 'nonsense')).toBeFalsy();
  });
  it('should validate correct ETH address in RSK network as false', () => {
    expect(isValidAddress(VALID_ETH_ADDRESS, RSK_TESTNET_CHAIN_ID)).toBeFalsy();
  });
  it('should validate correct RSK address in ETH network as false', () => {
    expect(isValidAddress(VALID_RSK_TESTNET_ADDRESS, ETH_CHAIN_ID)).toBeFalsy();
  });
  it('should validate correct RSK address in RSK testnet network as true', () => {
    expect(isValidAddress(VALID_RSK_TESTNET_ADDRESS, RSK_TESTNET_CHAIN_ID)).toBeTruthy();
  });
  it('should validate correct RSK address in RSK mainnet network as false', () => {
    expect(isValidAddress(VALID_RSK_TESTNET_ADDRESS, RSK_MAINNET_CHAIN_ID)).toBeFalsy();
  });
  it('should validate correct RSK address in RSK mainnet network as true', () => {
    expect(isValidAddress(VALID_RSK_MAINNET_ADDRESS, RSK_MAINNET_CHAIN_ID)).toBeTruthy();
  });
  it('should validate correct RSK mainnet address in RSK testnet network as false', () => {
    expect(isValidAddress(VALID_RSK_MAINNET_ADDRESS, RSK_TESTNET_CHAIN_ID)).toBeFalsy();
  });
  it('should validate an incorrect DPath as false', () => {
    expect(isValidPath('m/44/60/0/0')).toBeFalsy();
  });
  it('should validate private key as true', () => {
    expect(isValidPrivKey(VALID_ETH_PRIVATE_KEY)).toBeTruthy();
  });
  it('should validate invalid private key as false', () => {
    expect(isValidPrivKey(INVALID_ETH_PRIVATE_KEY)).toBeFalsy();
  });
  it('should validate 0x private keys as true', () => {
    expect(isValidPrivKey(VALID_ETH_PRIVATE_0X)).toBeTruthy();
  });
  it('should validate private key buffer type as true', () => {
    expect(isValidPrivKey(VALID_ETH_PRIVATE_BUFFER)).toBeTruthy();
  });
});

describe('Validator', () => {
  it('should validate correct DPaths as true', () => {
    valid.forEach(path => {
      expect(isValidPath(path)).toBeTruthy();
    });
  });
  it('should validate incorrect DPaths as false', () => {
    invalid.forEach(path => {
      expect(isValidPath(path)).toBeFalsy();
    });
  });
  it('should validate hardcoded DPaths as true', () => {
    DPaths.forEach(DPath => {
      expect(isValidPath(DPath.value)).toBeTruthy();
    });
  });
});

describe('isLabelWithoutENS', () => {
  it('should return false if the label contains an ENS TLD', () => {
    expect(isLabelWithoutENS('Foo.eth', ETH_CHAIN_ID)).toEqual(false);
    expect(isLabelWithoutENS('Foo.test', ETH_CHAIN_ID)).toEqual(false);
    expect(isLabelWithoutENS('Foo.reverse', ETH_CHAIN_ID)).toEqual(false);
  });
  it('should return true if a label does not contain an ENS TLD', () => {
    expect(isLabelWithoutENS('Foo', ETH_CHAIN_ID)).toEqual(true);
  });

  it('should return false if the label contains an RNS TLD', () => {
    expect(isLabelWithoutENS('Foo.rsk', RSK_MAINNET_CHAIN_ID)).toEqual(false);
  });
  it('should return true if a label does not contain an ENS TLD', () => {
    expect(isLabelWithoutENS('Foo', RSK_MAINNET_CHAIN_ID)).toEqual(true);
  });
});

describe('isValidAddressLabel', () => {
  const validAddress = '0x081f37708032d0a7b3622591a8959b213fb47d6f';
  const otherValidAddress = '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0';
  const addresses = {
    [validAddress]: 'Foo'
  };
  const labels = {
    Foo: validAddress
  };

  describe('Happy path', () => {
    it('should return valid', () => {
      expect(isValidAddressLabel(validAddress, 'Foo', {}, {}, 1).isValid).toEqual(true);
    });
  });
  describe('Invalid cases', () => {
    it('should return invalid when the provided address is invalid', () => {
      const { isValid, addressError } = isValidAddressLabel('derp', 'Foo', {}, {}, 1);

      expect(isValid).toEqual(false);
      expect(addressError).toEqual(translateRaw('INVALID_ADDRESS'));
    });

    it('should return invalid if the address already exists', () => {
      const { isValid, addressError } = isValidAddressLabel(
        validAddress,
        'Foo',
        addresses,
        labels,
        1
      );

      expect(isValid).toEqual(false);
      expect(addressError).toEqual(translateRaw('ADDRESS_ALREADY_EXISTS'));
    });

    it('should return invalid if the label is not of correct length', () => {
      const { isValid, labelError } = isValidAddressLabel(validAddress, 'X', {}, {}, 1);

      expect(isValid).toEqual(false);
      expect(labelError).toEqual(translateRaw('INVALID_LABEL_LENGTH'));
    });

    it('should return invalid if the label contains an ENS TLD', () => {
      const { isValid, labelError } = isValidAddressLabel(validAddress, 'Foo.eth', {}, {}, 1);

      expect(isValid).toEqual(false);
      expect(labelError).toEqual(translateRaw('LABEL_CANNOT_CONTAIN_ENS_SUFFIX'));
    });

    it('should return invalid if the label already exists', () => {
      const { isValid, labelError } = isValidAddressLabel(
        otherValidAddress,
        'Foo',
        addresses,
        labels,
        1
      );

      expect(isValid).toEqual(false);
      expect(labelError).toEqual(translateRaw('LABEL_ALREADY_EXISTS'));
    });
  });
});
