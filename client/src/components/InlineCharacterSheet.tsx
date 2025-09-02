import { useCharacter } from "@/context/CharacterContext";
import { formatModifier } from "@/lib/utils";

export default function InlineCharacterSheet() {
  const { character } = useCharacter();
  
  return (
    <div
      id="character-sheet"
      className="bg-white text-black p-6 w-[210mm] mx-auto font-comic"
    >
      {/* Two column grid matching the reference PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="text-center pb-4 border-b-2 border-gray-300">
            <h1 className="font-display text-4xl text-accent">{character.name || "Unnamed Character"}</h1>
            <p className="text-gray-700">
              {character.secretIdentity ? `Secret Identity: ${character.secretIdentity}` : "No secret identity"}
            </p>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Profile
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-bold">Origin:</span> 
                <span>{character.origin || "Not Selected"}</span>
              </div>
              <div>
                <span className="font-bold">Archetype:</span> 
                <span>{character.archetype || "Not Selected"}</span>
              </div>
              <div>
                <span className="font-bold">Gender:</span> 
                <span>{character.gender || "-"}</span>
              </div>
              <div>
                <span className="font-bold">Age:</span> 
                <span>{character.age || "-"}</span>
              </div>
              <div>
                <span className="font-bold">Height:</span> 
                <span>{character.height || "-"}</span>
              </div>
              <div>
                <span className="font-bold">Weight:</span> 
                <span>{character.weight || "-"}</span>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Ability Scores
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-bold">STR</div>
                <div className="text-2xl font-comic">{character.abilities.strength.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.strength.value ? formatModifier(character.abilities.strength.modifier) : "-"}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold">DEX</div>
                <div className="text-2xl font-comic">{character.abilities.dexterity.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.dexterity.value ? formatModifier(character.abilities.dexterity.modifier) : "-"}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold">CON</div>
                <div className="text-2xl font-comic">{character.abilities.constitution.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.constitution.value ? formatModifier(character.abilities.constitution.modifier) : "-"}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold">INT</div>
                <div className="text-2xl font-comic">{character.abilities.intelligence.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.intelligence.value ? formatModifier(character.abilities.intelligence.modifier) : "-"}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold">WIS</div>
                <div className="text-2xl font-comic">{character.abilities.wisdom.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.wisdom.value ? formatModifier(character.abilities.wisdom.modifier) : "-"}
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold">CHA</div>
                <div className="text-2xl font-comic">{character.abilities.charisma.value || "-"}</div>
                <div className="text-sm text-gray-600">
                  {character.abilities.charisma.value ? formatModifier(character.abilities.charisma.modifier) : "-"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Defenses
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Initiative</div>
                <div className="text-xl font-comic">
                  {formatModifier(character.initiative)}
                </div>
              </div>
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Defense</div>
                <div className="text-xl font-comic">{character.defense}</div>
              </div>
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Toughness</div>
                <div className="text-xl font-comic">{character.toughness}</div>
              </div>
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Fortitude</div>
                <div className="text-xl font-comic">{character.fortitude}</div>
              </div>
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Reflex</div>
                <div className="text-xl font-comic">{character.reflex}</div>
              </div>
              <div className="border border-gray-300 rounded p-2 text-center">
                <div className="font-bold">Willpower</div>
                <div className="text-xl font-comic">{character.willpower}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Skills
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {character.skills && character.skills.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {character.skills.map((skill, index) => (
                    <li key={index} className="py-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <span>{skill.ranks} {skill.specialization ? `(${skill.specialization})` : ""}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {skill.ability} based | {skill.trained ? "Trained" : "Untrained"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 italic text-center">No skills selected yet...</p>
              )}
            </div>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Powers
            </h3>
            <div className="space-y-2">
              {character.powers && character.powers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {character.powers.map((power, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{power.name}</span>
                        <span>Rank {power.rank}</span>
                      </div>
                      <p className="text-sm">{power.description}</p>
                      {(power.perks.length > 0 || power.flaws.length > 0) && (
                        <div className="mt-1 text-xs">
                          {power.perks.length > 0 && (
                            <div className="text-green-700">Perks: {power.perks.join(", ")}</div>
                          )}
                          {power.flaws.length > 0 && (
                            <div className="text-red-700">Flaws: {power.flaws.join(", ")}</div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 italic text-center">No powers selected yet...</p>
              )}
            </div>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Weaknesses
            </h3>
            <div className="space-y-2">
              {character.complications && character.complications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {character.complications.map((complication, index) => (
                    <li key={index} className="py-2">
                      <div className="font-medium">{complication.name}</div>
                      <p className="text-sm">{complication.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 italic text-center">No complications selected yet...</p>
              )}
            </div>
          </div>
          
          <div className="border-2 border-gray-800 rounded-lg p-4">
            <h3 className="font-comic text-xl mb-2 text-center border-b border-gray-400 pb-1 uppercase">
              Gear
            </h3>
            <div className="space-y-2">
              {character.gear && character.gear.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {character.gear.map((item, index) => (
                    <li key={index} className="py-2">
                      <div className="font-medium">{item.name}</div>
                      <p className="text-sm">{item.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 italic text-center">No gear selected yet...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
