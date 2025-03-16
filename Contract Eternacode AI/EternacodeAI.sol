// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PublicTextStorage {
    struct Version {
        string text;
        uint256 modifiedAt;
    }
    
    struct TextEntry {
        string currentText;
        uint256 createdAt;
        uint256 updatedAt;
        Version[] versions;
    }
    
    mapping(address => mapping(string => TextEntry)) private _entries;
    mapping(address => string[]) private _userEntries;

    event EntryCreated(address indexed user, string name, uint256 timestamp);
    event EntryUpdated(address indexed user, string name, uint256 timestamp);

    // Crear entrada (sin cambios)
    function createEntry(string memory name, string memory text) external {
        require(bytes(name).length > 0, "Nombre vacio");
        require(_entries[msg.sender][name].createdAt == 0, "Entrada existente");
        
        TextEntry storage newEntry = _entries[msg.sender][name];
        newEntry.currentText = text;
        newEntry.createdAt = block.timestamp;
        newEntry.updatedAt = block.timestamp;
        newEntry.versions.push(Version(text, block.timestamp));
        
        _userEntries[msg.sender].push(name);
        emit EntryCreated(msg.sender, name, block.timestamp);
    }

    // Actualizar entrada (sin cambios)
    function updateEntry(string memory name, string memory newText) external {
        TextEntry storage entry = _entries[msg.sender][name];
        require(entry.createdAt != 0, "Entrada no existe");
        
        entry.currentText = newText;
        entry.updatedAt = block.timestamp;
        entry.versions.push(Version(newText, block.timestamp));
        
        emit EntryUpdated(msg.sender, name, block.timestamp);
    }

    // Función MODIFICADA para incluir el nombre
    function getCurrentText(address user, string memory name) external view returns (
        string memory entryName,
        string memory text,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        TextEntry storage entry = _entries[user][name];
        require(entry.createdAt != 0, "Entrada no existe");
        return (name, entry.currentText, entry.createdAt, entry.updatedAt);
    }

    // Resto de funciones se mantienen igual...
    // [Las otras funciones getVersionCount, getSpecificVersion, etc.]
    function getVersionCount(address user, string memory name) external view returns (uint256) {
        require(_entries[user][name].createdAt != 0, "Entrada no existe");
        return _entries[user][name].versions.length;
    }

    function getSpecificVersion(address user, string memory name, uint256 index) external view returns (
        string memory text,
        uint256 modifiedAt
    ) {
        require(_entries[user][name].createdAt != 0, "Entrada no existe");
        Version storage version = _entries[user][name].versions[index];
        return (version.text, version.modifiedAt);
    }

    function getRecentVersions(address user, string memory name, uint256 count) external view returns (Version[] memory) {
        TextEntry storage entry = _entries[user][name];
        require(entry.createdAt != 0, "Entrada no existe");
        
        Version[] storage allVersions = entry.versions;
        uint256 start = allVersions.length > count ? allVersions.length - count : 0;
        
        Version[] memory result = new Version[](allVersions.length - start);
        for(uint256 i = start; i < allVersions.length; i++) {
            result[i - start] = allVersions[i];
        }
        return result;
    }

    // Obtener todas las entradas de un usuario
    function getUserEntries(address user) external view returns (string[] memory) {
        return _userEntries[user];
    }
}