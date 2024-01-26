using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("Grupos")]
    [ApiController]
    public class GrupoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public GrupoesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetGrupos()
        {
            if (_context.Grupos == null)
            {
                return NotFound();
            }

            var result = await _context.Grupos
                .Select(grupo => new
                {
                    grupo.GrupoId,
                    grupo.Nombre
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGrupo(int id)
        {
            if (_context.Grupos == null)
            {
                return NotFound();
            }

            var grupo = await _context.Grupos
                .Where(grupo => grupo.GrupoId == id)
                .Select(grupo => new
                {
                    grupo.GrupoId,
                    grupo.Nombre
                })
                .FirstOrDefaultAsync();

            if (grupo == null)
            {
                return NotFound();
            }

            return Ok(grupo);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutGrupo(int id, Grupo grupo)
        {
            if (id != grupo.GrupoId)
            {
                return BadRequest();
            }

            _context.Entry(grupo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GrupoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        public class GrupoCreateModel
        {
            public string Nombre { get; set; }
        }


        [HttpPost]
        public async Task<ActionResult<Grupo>> PostGrupo(GrupoCreateModel grupoModel)
        {
            if (_context.Grupos == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Grupos' is null.");
            }

            if (string.IsNullOrWhiteSpace(grupoModel.Nombre))
            {
                return BadRequest("El nombre es obligatorio.");
            }

            var grupo = new Grupo
            {
                Nombre = grupoModel.Nombre
            };

            _context.Grupos.Add(grupo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGrupo", new { id = grupo.GrupoId }, grupo);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGrupo(int id)
        {
            if (_context.Grupos == null)
            {
                return NotFound();
            }
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
            {
                return NotFound();
            }

            _context.Grupos.Remove(grupo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GrupoExists(int id)
        {
            return (_context.Grupos?.Any(e => e.GrupoId == id)).GetValueOrDefault();
        }
    }
}
