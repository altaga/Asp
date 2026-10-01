// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Asp Tokyo 2026 Capsule — 10 limited editions, art fully on-chain.
/// @notice Editions are minted into the contract and only leave through `release`, which the
///         Asp drop server calls once per settled USDC payment (keyed by `claimId`).
contract AspDrop is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10;
    uint256 public totalMinted;
    uint256 public nextRelease = 1;
    mapping(bytes32 => uint256) public tokenOfClaim;

    event Released(bytes32 indexed claimId, address indexed to, uint256 indexed tokenId);

    error SoldOut();
    error AlreadyReleased();
    error NothingToRelease();

    constructor(address owner_) ERC721("Asp Tokyo 2026 Capsule", "ASPCAP") Ownable(owner_) {}

    function mintEditions(uint256 count) external onlyOwner {
        if (totalMinted + count > MAX_SUPPLY) revert SoldOut();
        for (uint256 i; i < count; i++) {
            _mint(address(this), ++totalMinted);
        }
    }

    function release(address to, bytes32 claimId) external onlyOwner returns (uint256 tokenId) {
        if (tokenOfClaim[claimId] != 0) revert AlreadyReleased();
        tokenId = nextRelease;
        if (tokenId > totalMinted) revert NothingToRelease();
        nextRelease = tokenId + 1;
        tokenOfClaim[claimId] = tokenId;
        _transfer(address(this), to, tokenId);
        emit Released(claimId, to, tokenId);
    }

    function remaining() external view returns (uint256) {
        return totalMinted - (nextRelease - 1);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        (string memory name, , ) = _colorway(tokenId);
        string memory json = string.concat(
            '{"name":"Asp Capsule #', tokenId.toString(),
            '","description":"One of 10 limited capsules from the Asp Tokyo 2026 gachapon. Proven human with World ID, paid in USDC on Monad.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(_svg(tokenId))),
            '","attributes":[{"trait_type":"Edition","value":"', tokenId.toString(), ' / 10"},',
            '{"trait_type":"Colorway","value":"', name, '"},',
            '{"trait_type":"Drop","value":"Tokyo 2026"},{"trait_type":"Chain","value":"Monad"}]}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    /// Keep in sync with asp-dapp/src/features/nft/nftArt.ts (preview mirror).
    function _colorway(uint256 id) internal pure returns (string memory name, string memory a, string memory b) {
        uint256 i = (id - 1) % 10;
        if (i == 0) return ("Monad Violet", "#836EF9", "#3A2BB8");
        if (i == 1) return ("Sakura", "#FF7AA2", "#B5179E");
        if (i == 2) return ("Tokyo Red", "#FF3B30", "#8B0000");
        if (i == 3) return ("Matcha", "#8BD48E", "#2E7D32");
        if (i == 4) return ("Harbor Blue", "#3FA9F5", "#1A4F9C");
        if (i == 5) return ("Gold Leaf", "#FFC94A", "#C77700");
        if (i == 6) return ("Ice", "#9BE7FF", "#3D8BD9");
        if (i == 7) return ("Sunset", "#FF8A3D", "#C2185B");
        if (i == 8) return ("Chrome", "#D9D9E0", "#5E5E6A");
        return ("Volt", "#D4FF3F", "#5FA800");
    }

    function _upper(string memory s) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        for (uint256 i; i < b.length; i++) {
            if (b[i] >= 0x61 && b[i] <= 0x7A) b[i] = bytes1(uint8(b[i]) - 32);
        }
        return string(b);
    }

    function _svg(uint256 id) internal pure returns (string memory) {
        (string memory name, string memory a, string memory b) = _colorway(id);
        return string.concat(_svgArt(a, b), _svgText(id, name, a));
    }

    function _svgArt(string memory a, string memory b) internal pure returns (string memory) {
        return string.concat(
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>",
            "<defs><radialGradient id='g' cx='50%' cy='45%' r='60%'><stop offset='0' stop-color='", a,
            "' stop-opacity='.45'/><stop offset='1' stop-color='#0B0B0F' stop-opacity='0'/></radialGradient>",
            "<linearGradient id='t' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='", a,
            "'/><stop offset='1' stop-color='", b, "'/></linearGradient>",
            "<clipPath id='c'><rect x='130' y='90' width='140' height='220' rx='70'/></clipPath></defs>",
            "<rect width='400' height='400' fill='#0B0B0F'/><rect width='400' height='400' fill='url(#g)'/>",
            "<g transform='rotate(-18 200 200)'><g clip-path='url(#c)'>",
            "<rect x='130' y='90' width='140' height='110' fill='url(#t)'/>",
            "<rect x='130' y='200' width='140' height='110' fill='#F4F4F6'/></g>",
            "<rect x='130' y='90' width='140' height='220' rx='70' fill='none' stroke='#FFFFFF' stroke-opacity='.55' stroke-width='3'/>",
            "<rect x='124' y='193' width='152' height='14' rx='7' fill='#111111'/>",
            "<ellipse cx='170' cy='140' rx='12' ry='30' fill='#FFFFFF' fill-opacity='.35'/>",
            "<text x='200' y='266' text-anchor='middle' font-family='Helvetica,Arial,sans-serif' font-weight='800' font-size='34' fill='#111111'>ASP</text></g>"
        );
    }

    function _svgText(uint256 id, string memory name, string memory a) internal pure returns (string memory) {
        string memory ed = id < 10 ? string.concat("0", id.toString()) : id.toString();
        return string.concat(
            "<text x='28' y='46' font-family='Helvetica,Arial,sans-serif' font-size='13' font-weight='700' letter-spacing='3' fill='#FFFFFF' fill-opacity='.7'>TOKYO 2026 / LIMITED</text>",
            "<text x='372' y='46' text-anchor='end' font-family='Helvetica,Arial,sans-serif' font-size='13' font-weight='700' letter-spacing='3' fill='#FFFFFF' fill-opacity='.7'>MONAD</text>",
            "<text x='28' y='368' font-family='Helvetica,Arial,sans-serif' font-size='34' font-weight='800' fill='#FFFFFF'>#", ed,
            "<tspan font-size='16' fill-opacity='.55' dx='8'>/ 10</tspan></text>",
            "<text x='372' y='366' text-anchor='end' font-family='Helvetica,Arial,sans-serif' font-size='13' font-weight='700' letter-spacing='2' fill='", a,
            "'>", _upper(name), "</text></svg>"
        );
    }
}
