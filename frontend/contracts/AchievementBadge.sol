// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AchievementBadge is ERC721, Ownable {
    uint256 private _tokenIds;

    // Badge types mapping
    mapping(uint256 => BadgeType) public badgeTypes;
    mapping(address => mapping(uint256 => bool)) public userBadges;
    mapping(uint256 => BadgeMetadata) public tokenMetadata;

    struct BadgeType {
        string name;
        string description;
        string imageURI;
        bool exists;
    }

    struct BadgeMetadata {
        uint256 badgeTypeId;
        uint256 mintedAt;
        address recipient;
    }

    event BadgeTypeAdded(uint256 indexed badgeTypeId, string name, string description);
    event BadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 indexed badgeTypeId);

    constructor() ERC721("StartUp Quest Achievement Badges", "SQAB") Ownable(msg.sender) {}

    function addBadgeType(
        uint256 _badgeTypeId,
        string memory _name,
        string memory _description,
        string memory _imageURI
    ) external onlyOwner {
        require(!badgeTypes[_badgeTypeId].exists, "Badge type already exists");
        
        badgeTypes[_badgeTypeId] = BadgeType({
            name: _name,
            description: _description,
            imageURI: _imageURI,
            exists: true
        });

        emit BadgeTypeAdded(_badgeTypeId, _name, _description);
    }

    function mintBadge(address _recipient, uint256 _badgeTypeId) external onlyOwner returns (uint256) {
        require(badgeTypes[_badgeTypeId].exists, "Badge type does not exist");
        require(!userBadges[_recipient][_badgeTypeId], "User already has this badge");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(_recipient, newTokenId);
        userBadges[_recipient][_badgeTypeId] = true;

        tokenMetadata[newTokenId] = BadgeMetadata({
            badgeTypeId: _badgeTypeId,
            mintedAt: block.timestamp,
            recipient: _recipient
        });

        emit BadgeMinted(_recipient, newTokenId, _badgeTypeId);
        return newTokenId;
    }

    function hasBadge(address _user, uint256 _badgeTypeId) external view returns (bool) {
        return userBadges[_user][_badgeTypeId];
    }

    function getBadgeMetadata(uint256 _tokenId) external view returns (BadgeMetadata memory) {
        require(_exists(_tokenId), "Token does not exist");
        return tokenMetadata[_tokenId];
    }

    function getBadgeType(uint256 _badgeTypeId) external view returns (BadgeType memory) {
        require(badgeTypes[_badgeTypeId].exists, "Badge type does not exist");
        return badgeTypes[_badgeTypeId];
    }

    function getUserBadges(address _user) external view returns (uint256[] memory) {
        uint256[] memory userBadgeList = new uint256[](100); // Max 100 badge types
        uint256 count = 0;
        
        for (uint256 i = 1; i <= 100; i++) {
            if (badgeTypes[i].exists && userBadges[_user][i]) {
                userBadgeList[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userBadgeList[i];
        }
        
        return result;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist");
        
        BadgeMetadata memory metadata = tokenMetadata[_tokenId];
        BadgeType memory badgeType = badgeTypes[metadata.badgeTypeId];
        
        return badgeType.imageURI;
    }

    function _exists(uint256 _tokenId) internal view returns (bool) {
        return _ownerOf(_tokenId) != address(0);
    }
} 